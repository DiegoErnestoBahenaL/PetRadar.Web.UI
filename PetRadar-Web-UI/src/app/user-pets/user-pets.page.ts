import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserPetsService } from '../api/petradar/api/userPets.service';
import { UserPetViewModel } from '../api/petradar/model/userPetViewModel';

import { PetDialogComponent, PetDialogData } from './pet-dialog.component';
import { RoleEnum } from '../services/permission.service';
import { HttpClient } from '@angular/common/http';



type SortKey = 'id' | 'userId' | 'name' | 'species' | 'sex' | 'size';
type SortDir = 'asc' | 'desc';
type UserRole = 'SuperAdmin' | 'Admin' | 'Organization' | 'User' | string;

@Component({
  selector: 'app-user-pets-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PetDialogComponent],
  templateUrl: './user-pets.page.html',
  styleUrl: './user-pets.page.scss',
  
})
export class UserPetsPageComponent implements OnDestroy {
  private petsApi = inject(UserPetsService);
  private http = inject(HttpClient);
  loading = false;

  pets: UserPetViewModel[] = [];

  filter = '';
  sortKey: SortKey = 'id';
  sortDir: SortDir = 'asc';

  page = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  modalOpen = false;
  modalData: PetDialogData = { mode: 'create' };

  toastMsg: string | null = null;
  private toastTimer: any = null;

  petImageUrls: Record<number, string> = {};
  loadingPetImages = new Set<number>();

  currentUser = this.getCurrentUser();

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    Object.values(this.petImageUrls).forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }


  currentRole: RoleEnum | null = this.getRoleFromToken();
currentUserId: number | null = this.getUserIdFromToken();

get isAdminView(): boolean {
  return this.currentRole === RoleEnum.Admin || this.currentRole === RoleEnum.SuperAdmin;
}

get isPetCardView(): boolean {
  return this.currentRole === RoleEnum.User || this.currentRole === RoleEnum.Organization;
}

get canManageOwnPets(): boolean {
  return this.currentRole === RoleEnum.Organization;
}

private getRoleFromToken(): RoleEnum | null {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    const role =
      payload.role ??
      payload.Role ??
      payload.roles?.[0] ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    return role as RoleEnum;
  } catch {
    return null;
  }
}

private getUserIdFromToken(): number | null {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    const userId =
      payload.userId ??
      payload.UserId ??
      payload.id ??
      payload.nameid ??
      payload.sub ??
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    return userId != null ? Number(userId) : null;
  } catch {
    return null;
  }
}

  

  get currentUserRole(): UserRole {
    return (
      this.currentUser?.role ??
      this.currentUser?.userRole ??
      this.currentUser?.roleName ??
      ''
    );
  }

 

  private getCurrentUser(): any {
    const raw = localStorage.getItem('user');
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  load(): void {
    this.loading = true;

    const request$ =
      this.isAdminView || !this.currentUserId
        ? this.petsApi.apiUserPetsGet()
        : this.petsApi.apiUserPetsUserUserIdGet(this.currentUserId);

    request$.subscribe({
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

  get filteredPets(): UserPetViewModel[] {
    const f = this.filter.trim().toLowerCase();
    if (!f) return this.pets;

    return this.pets.filter((p) => {
      const haystack = [
        p.id,
        p.userId,
        p.name,
        p.species,
        p.breed,
        p.color,
        p.sex,
        p.size,
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

      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

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

  openCreate(): void {
    if (!this.canManageOwnPets) return;

    this.modalData = { mode: 'create' };
    this.modalOpen = true;
  }

  openEdit(pet: UserPetViewModel): void {
    if (!this.canManageOwnPets && !this.isAdminView) return;

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
    if (!this.canManageOwnPets && !this.isAdminView) return;

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

  getPetMainImage(petId?: number | null): string {
    if (!petId) return 'assets/img/pet-placeholder.png';

    if (!this.petImageUrls[petId] && !this.loadingPetImages.has(petId)) {
      this.loadPetMainImage(petId);
    }

    return this.petImageUrls[petId] ?? 'assets/img/pet-placeholder.png';
  }

  private loadPetMainImage(petId: number): void {
    this.loadingPetImages.add(petId);

    this.http
      .get(`https://api-qa.petradar-qa.org/api/UserPets/${petId}/mainpicture`, {
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          this.petImageUrls[petId] = URL.createObjectURL(blob);
          this.loadingPetImages.delete(petId);
        },
        error: () => {
          this.petImageUrls[petId] = 'assets/img/pet-placeholder.png';
          this.loadingPetImages.delete(petId);
        },
      });
  }

  translateSpecies(value?: string | null): string {
    if (!value) return 'N/D';

    const normalized = value.trim().toLowerCase();

    if (normalized === 'dog') return 'Perro';
    if (normalized === 'cat') return 'Gato';

    return value;
  }

  translateSex(value?: string | null): string {
    if (!value) return 'N/D';

    const normalized = value.trim().toLowerCase();

    if (normalized === 'male') return 'Macho';
    if (normalized === 'female') return 'Hembra';

    return value;
  }

  translateSize(value?: string | null): string {
    if (!value) return 'N/D';

    const normalized = value.trim().toLowerCase();

    if (normalized === 'small') return 'Pequeño';
    if (normalized === 'medium') return 'Mediano';
    if (normalized === 'large') return 'Grande';

    return value;
  }

  formatBoolean(value?: boolean | null): string {
    if (value === true) return 'Sí';
    if (value === false) return 'No';
    return 'N/D';
  }

  showToast(msg: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info'): void {
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