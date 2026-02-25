import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { UserPetsService } from '../api/petradar/api/userPets.service';
import { UserPetViewModel } from '../api/petradar/model/userPetViewModel';
import { PetDialogComponent, PetDialogData } from './pet-dialog.component';

@Component({
  selector: 'app-user-pets-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './user-pets.page.html',
})
export class UserPetsPageComponent implements AfterViewInit {
  private petsApi = inject(UserPetsService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  loading = false;

  displayedColumns: string[] = ['id', 'userId', 'name', 'species', 'sex', 'size', 'actions'];
  dataSource = new MatTableDataSource<UserPetViewModel>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.load(); // revisar
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.load();
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  load(): void {
    this.loading = true;
    this.petsApi.apiUserPetsGet().subscribe({
      next: (pets) => {
        this.dataSource.data = pets ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snack.open(err?.message ?? 'Error cargando mascotas', 'OK', { duration: 3500 });
      },
    });
  }

  openCreate(): void {
    const ref = this.dialog.open<PetDialogComponent, PetDialogData, boolean>(PetDialogComponent, {
      width: '680px',
      data: { mode: 'create' },
      disableClose: true,
    });

    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.snack.open('Mascota creada', 'OK', { duration: 2000 });
      this.load();
    });
  }

  openEdit(pet: UserPetViewModel): void {
    const ref = this.dialog.open<PetDialogComponent, PetDialogData, boolean>(PetDialogComponent, {
      width: '680px',
      data: { mode: 'edit', pet },
      disableClose: true,
    });

    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.snack.open('Mascota actualizada', 'OK', { duration: 2000 });
      this.load();
    });
  }

  delete(pet: UserPetViewModel): void {
    const id = pet.id;
    if (id == null) {
      this.snack.open('La mascota no tiene id', 'OK', { duration: 2500 });
      return;
    }
    if (!confirm(`¿Eliminar mascota #${id}?`)) return;

    this.petsApi.apiUserPetsIdDelete(id).subscribe({
      next: () => {
        this.snack.open('Mascota eliminada', 'OK', { duration: 2000 });
        this.load();
      },
      error: (err) => this.snack.open(err?.message ?? 'No se pudo eliminar', 'OK', { duration: 3500 }),
    });
  }
}
