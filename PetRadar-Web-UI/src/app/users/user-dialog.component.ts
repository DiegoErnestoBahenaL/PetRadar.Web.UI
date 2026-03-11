import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UsersService } from '../api/petradar/api/users.service';
import { UserCreateModel } from '../api/petradar/model/userCreateModel';
import { UserUpdateModel } from '../api/petradar/model/userUpdateModel';
import { UserViewModel } from '../api/petradar/model/userViewModel';
import { RoleEnum } from '../api/petradar/model/roleEnum';

export type UserDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; user: UserViewModel };

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-dialog.component.html',
})
export class UserDialogComponent {
  private fb = inject(FormBuilder);
  private usersApi = inject(UsersService);

  @Input() open = false;

  @Input() set data(value: UserDialogData | null) {
    this._data = value;
    this.initFromData();
  }
  get data() {
    return this._data;
  }
  private _data: UserDialogData | null = null;

  @Output() closed = new EventEmitter<boolean>();

  saving = false;
  errorMsg: string | null = null;

  // Create: email, password, name (required)
  // Update: opcionales (password opcional)
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''], // required solo en create
    name: ['', [Validators.required, Validators.minLength(2)]],
    lastName: [''],
    phoneNumber: [''],
    profilePhotoURL: [''],
    organizationName: [''],
    organizationAddress: [''],
    organizationPhone: [''],
  });

  private initFromData() {
    this.errorMsg = null;

    // reset validators for password every time
    this.form.controls.password.clearValidators();
    this.form.controls.password.setValue('');
    this.form.controls.password.updateValueAndValidity({ emitEvent: false });

    if (!this._data) return;

    if (this._data.mode === 'edit') {
      const u = this._data.user;
      this.form.patchValue({
        email: u.email ?? '',
        name: (u as any).name ?? (u as any).firstName ?? '',
        lastName: u.lastName ?? '',
        phoneNumber: u.phoneNumber ?? '',
        profilePhotoURL: u.profilePhotoURL ?? '',
        organizationName: (u as any).organizationName ?? '',
        organizationAddress: (u as any).organizationAddress ?? '',
        organizationPhone: (u as any).organizationPhone ?? '',
      });

      // this.form.controls.email.disable();
      this.form.controls.email.enable();
      return;
    }

    // create mode
    this.form.reset();
    this.form.controls.email.enable();

    this.form.controls.password.addValidators([Validators.required, Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity({ emitEvent: false });
  }

  close(ok: boolean = false): void {
    if (this.saving) return;
    this.closed.emit(ok);
  }

  save(): void {
    if (!this._data) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMsg = null;

    if (this._data.mode === 'create') {
      const payload: UserCreateModel = {
        email: this.form.value.email!,
        password: this.form.value.password!,
        name: this.form.value.name!,
        lastName: this.form.value.lastName || null,
        phoneNumber: this.form.value.phoneNumber || null,
        organizationName: this.form.value.organizationName || null,
        organizationAddress: this.form.value.organizationAddress || null,
        organizationPhone: this.form.value.organizationPhone || null,
        role: RoleEnum.User,
      };

      this.usersApi.apiUsersPost(payload).subscribe({
        next: () => {
          this.saving = false;
          this.close(true);
        },
        error: (err) => {
          this.saving = false;
          this.errorMsg = err?.message ?? 'Error creando usuario';
        },
      });

      return;
    }

    const id = this._data.user.id!;
    const payload: UserUpdateModel = {
      email: this.form.value.email || null,
      password: this.form.value.password || null,
      name: this.form.value.name || null,
      lastName: this.form.value.lastName || null,
      phoneNumber: this.form.value.phoneNumber || null,
      organizationName: this.form.value.organizationName || null,
      organizationAddress: this.form.value.organizationAddress || null,
      organizationPhone: this.form.value.organizationPhone || null,
    };

    this.usersApi.apiUsersIdPut(id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.errorMsg = err?.message ?? 'Error actualizando usuario';
      },
    });
  }
}