import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UsersService } from '../api/petradar/api/users.service';
import { UserCreateModel } from '../api/petradar/model/userCreateModel';
import { UserUpdateModel } from '../api/petradar/model/userUpdateModel';
import { UserViewModel } from '../api/petradar/model/userViewModel';

export type UserDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; user: UserViewModel };

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-dialog.component.html',
})
export class UserDialogComponent {
  private fb = inject(FormBuilder);
  private usersApi = inject(UsersService);
  private snack = inject(MatSnackBar);

  saving = false;

  
  // Create: email, password, name 
  // Update: todos opcionales
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''], // required SOLO en create 
    name: ['', [Validators.required, Validators.minLength(2)]],
    lastName: [''],
    phoneNumber: [''],
    profilePhotoURL: [''],
    organizationName: [''],
    organizationAddress: [''],
    organizationPhone: [''],
  });

  constructor(
    private ref: MatDialogRef<UserDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    if (data.mode === 'edit') {
      // Password no obligatorio en edit
      this.form.patchValue({
        email: data.user.email ?? '',
        name: data.user.name ?? '',
        lastName: data.user.lastName ?? '',
        phoneNumber: data.user.phoneNumber ?? '',
        profilePhotoURL: data.user.profilePhotoURL ?? '',
        organizationName: (data.user as any).organizationName ?? '',
        organizationAddress: (data.user as any).organizationAddress ?? '',
        organizationPhone: (data.user as any).organizationPhone ?? '',
      });
    } else {
      // Password obligatorio en create
      this.form.controls.password.addValidators([Validators.required, Validators.minLength(6)]);
      this.form.controls.password.updateValueAndValidity();
    }
  }

  close(): void {
    this.ref.close(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    if (this.data.mode === 'create') {
      const payload: UserCreateModel = {
        email: this.form.value.email!,
        password: this.form.value.password!, 
        name: this.form.value.name!,
        lastName: this.form.value.lastName || null,
        phoneNumber: this.form.value.phoneNumber || null,
        organizationName: this.form.value.organizationName || null,
        organizationAddress: this.form.value.organizationAddress || null,
        organizationPhone: this.form.value.organizationPhone || null,
        // role: undefined // NOTA
      };

      this.usersApi.apiUsersPost(payload).subscribe({
        next: () => {
          this.saving = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.saving = false;
          this.snack.open(err?.message ?? 'Error creando usuario', 'OK', { duration: 3500 });
        },
      });

      return;
    }

    const payload: UserUpdateModel = {
      email: this.form.value.email || null,
      password: this.form.value.password || null, 
      name: this.form.value.name || null,
      lastName: this.form.value.lastName || null,
      phoneNumber: this.form.value.phoneNumber || null,
      organizationName: this.form.value.organizationName || null,
      organizationAddress: this.form.value.organizationAddress || null,
      organizationPhone: this.form.value.organizationPhone || null,
      // role: undefined // opcional
    };

    this.usersApi.apiUsersIdPut(this.data.user.id!, payload).subscribe({
      next: () => {
        this.saving = false;
        this.ref.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err?.message ?? 'Error actualizando usuario', 'OK', { duration: 3500 });
      },
    });
  }
}
