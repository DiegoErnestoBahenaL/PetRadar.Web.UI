import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UsersService } from '../api/petradar/api/users.service';
import { UserViewModel } from '../api/petradar/model/userViewModel';

import { UserDialogComponent, UserDialogData } from './user-dialog.component';

type SortKey = 'id' | 'email' | 'name' | 'lastName' | 'phoneNumber' | 'isActive';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UserDialogComponent],
  templateUrl: './users.page.html',
})
export class UsersPageComponent {
  private usersApi = inject(UsersService);

  loading = false;

  // data
  users: UserViewModel[] = [];

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
  modalData: UserDialogData = { mode: 'create' };

  // feedback 
  toastMsg: string | null = null;
  private toastTimer: any = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.usersApi.apiUsersGet().subscribe({
      next: (users) => {
        this.users = users ?? [];
        this.loading = false;
        this.ensurePageInRange();
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err?.message ?? 'Error cargando usuarios', 'danger');
      },
    });
  }

  // ---------- derived data ----------
  get filteredUsers(): UserViewModel[] {
    const f = this.filter.trim().toLowerCase();
    if (!f) return this.users;

    return this.users.filter((u) => {
      const haystack = [
        u.id,
        u.email,
        (u as any).name ?? (u as any).firstName ?? '',
        u.lastName ?? '',
        u.phoneNumber ?? '',
       
      ]
        .map((x) => (x ?? '').toString().toLowerCase())
        .join(' ');
      return haystack.includes(f);
    });
  }

  get sortedUsers(): UserViewModel[] {
    const arr = [...this.filteredUsers];
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
    return this.sortedUsers.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pagedUsers(): UserViewModel[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sortedUsers.slice(start, start + this.pageSize);
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

  openEdit(user: UserViewModel): void {
    this.modalData = { mode: 'edit', user };
    this.modalOpen = true;
  }

  onUserDialogClosed(ok: boolean): void {
    this.modalOpen = false;
    if (!ok) return;

    this.showToast(
      this.modalData.mode === 'create' ? 'Usuario creado' : 'Usuario actualizado',
      'success'
    );
    this.load();
  }

  delete(user: UserViewModel): void {
    if (!user.id) return;

    const email = user.email ?? '(sin email)';
    if (!confirm(`¿Eliminar usuario ${email}?`)) return;

    this.usersApi.apiUsersIdDelete(user.id).subscribe({
      next: () => {
        this.showToast('Usuario eliminado', 'success');
        this.load();
      },
      error: (err) => this.showToast(err?.message ?? 'Error eliminando', 'danger'),
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