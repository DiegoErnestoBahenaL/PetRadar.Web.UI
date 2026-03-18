import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserPetsService } from '../api/petradar/api/userPets.service';
import { UserPetViewModel } from '../api/petradar/model/userPetViewModel';

import { PetDialogComponent, PetDialogData } from './pet-dialog.component';

type SortKey = 'id' | 'userId' | 'name' | 'species' | 'sex' | 'size';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-user-pets-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PetDialogComponent],
  templateUrl: './user-pets.page.html',
})
export class UserPetsPageComponent {
  private petsApi = inject(UserPetsService);

  loading = false;

  // data
  pets: UserPetViewModel[] = [];

  // filter + sort
  filter = '';
  sortKey: SortKey = 'id';
  sortDir: SortDir = 'asc';

  // pagination
  page = 1; // 1-based
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  // modal
  modalOpen = false;
  modalData: PetDialogData = { mode: 'create' };

  // feedback 
  toastMsg: string | null = null;
  private toastTimer: any = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.petsApi.apiUserPetsGet().subscribe({
      next: (pets) => {
        this.pets = pets ?? [];
        this.loading = false;
        this.ensurePageInRange();
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err?.message ?? 'Error cargando mascotas', 'danger');
      },
    });
  }

  // ---------- derived data ----------
  get filteredPets(): UserPetViewModel[] {
    const f = this.filter.trim().toLowerCase();
    if (!f) return this.pets;

    return this.pets.filter((p) => {
      const haystack = [
        p.id,
        p.userId,
        p.name,
        (p as any).species,
        (p as any).sex,
        (p as any).size,
      ]
        .map((x) => (x ?? '').toString().toLowerCase())
        .join(' ');
      return haystack.includes(f);
    });
  }

  get sortedPets(): UserPetViewModel[] {
    const arr = [...this.filteredPets];
    const key = this.sortKey;
    const dir = this.sortDir;

    arr.sort((a, b) => {
      const va = (a as any)[key];
      const vb = (b as any)[key];

      // nulls last
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

      // number vs string
      if (typeof va === 'number' && typeof vb === 'number') {
        return dir === 'asc' ? va - vb : vb - va;
      }

      const sa = va.toString().toLowerCase();
      const sb = vb.toString().toLowerCase();
      if (sa < sb) return dir === 'asc' ? -1 : 1;
      if (sa > sb) return dir === 'asc' ? 1 : -1;
      return 0;
    });

    return arr;
  }

  get totalItems(): number {
    return this.sortedPets.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pagedPets(): UserPetViewModel[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sortedPets.slice(start, start + this.pageSize);
  }

  // ---------- UI actions ----------
  applyFilter(): void {
    this.page = 1;
    this.ensurePageInRange();
  }

  toggleSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
    this.ensurePageInRange();
  }

  prevPage(): void {
    this.page = Math.max(1, this.page - 1);
  }

  nextPage(): void {
    this.page = Math.min(this.totalPages, this.page + 1);
  }

  private ensurePageInRange(): void {
    this.page = Math.min(this.page, this.totalPages);
    this.page = Math.max(1, this.page);
  }

  // ---------- modal ----------
  openCreate(): void {
    this.modalData = { mode: 'create' };
    this.modalOpen = true;
  }

  openEdit(pet: UserPetViewModel): void {
    this.modalData = { mode: 'edit', pet };
    this.modalOpen = true;
  }

  onPetDialogClosed(ok: boolean): void {
    this.modalOpen = false;
    if (!ok) return;

    this.showToast(
      this.modalData.mode === 'create' ? 'Mascota creada' : 'Mascota actualizada',
      'success'
    );
    this.load();
  }

  delete(pet: UserPetViewModel): void {
    const id = pet.id;
    if (id == null) {
      this.showToast('La mascota no tiene id', 'warning');
      return;
    }
    if (!confirm(`¿Eliminar mascota #${id}?`)) return;

    this.petsApi.apiUserPetsIdDelete(id).subscribe({
      next: () => {
        this.showToast('Mascota eliminada', 'success');
        this.load();
      },
      error: (err) => this.showToast(err?.message ?? 'No se pudo eliminar', 'danger'),
    });
  }

  // ---------- toast helper ----------
  showToast(msg: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info') {
    this.toastMsg = `${type}::${msg}`;

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toastMsg = null), 2500);
  }

  get toastType(): string {
    if (!this.toastMsg) return 'info';
    return this.toastMsg.split('::')[0] || 'info';
  }

  get toastText(): string {
    if (!this.toastMsg) return '';
    return this.toastMsg.split('::').slice(1).join('::');
  }
}