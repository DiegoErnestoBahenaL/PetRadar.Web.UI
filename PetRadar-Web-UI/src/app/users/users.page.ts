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

import { UsersService } from '../api/petradar/api/users.service';
import { UserViewModel } from '../api/petradar/model/userViewModel';
import { UserDialogComponent, UserDialogData } from './user-dialog.component';

@Component({
  selector: 'app-users-page',
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
  templateUrl: './users.page.html',
})
export class UsersPageComponent implements AfterViewInit {

  private usersApi = inject(UsersService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  loading = false;

  displayedColumns = [
    'id',
    'email',
    'firstName',
    'lastName',
    'phoneNumber',
    'isActive',
    'actions'
  ];

  dataSource = new MatTableDataSource<UserViewModel>([]);

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

  load() {
    this.loading = true;

    this.usersApi.apiUsersGet().subscribe({
      next: users => {
        this.dataSource.data = users ?? [];
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.snack.open(err?.message ?? 'Error cargando usuarios', 'OK', { duration: 3500 });
      }
    });
  }

  openCreate() {
    const ref = this.dialog.open<UserDialogComponent, UserDialogData, boolean>(
      UserDialogComponent,
      {
        width: '650px',
        data: { mode: 'create' }
      }
    );

    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.snack.open('Usuario creado', 'OK', { duration: 2000 });
        this.load();
      }
    });
  }

  openEdit(user: UserViewModel) {
    const ref = this.dialog.open<UserDialogComponent, UserDialogData, boolean>(
      UserDialogComponent,
      {
        width: '650px',
        data: { mode: 'edit', user }
      }
    );

    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.snack.open('Usuario actualizado', 'OK', { duration: 2000 });
        this.load();
      }
    });
  }

  delete(user: UserViewModel) {

    if (!user.id) return;

    if (!confirm(`¿Eliminar usuario ${user.email}?`)) return;

    this.usersApi.apiUsersIdDelete(user.id).subscribe({

      next: () => {
        this.snack.open('Usuario eliminado', 'OK', { duration: 2000 });
        this.load();
      },

      error: err =>
        this.snack.open(err?.message ?? 'Error eliminando', 'OK', { duration: 3500 })
    });
  }

}
