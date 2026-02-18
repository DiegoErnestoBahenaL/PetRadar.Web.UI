import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UserPetsService } from '../api/petradar/api/userPets.service';
import { UserPetCreateModel } from '../api/petradar/model/userPetCreateModel';
import { UserPetUpdateModel } from '../api/petradar/model/userPetUpdateModel';
import { UserPetViewModel } from '../api/petradar/model/userPetViewModel';

import { PetSpeciesEnum } from '../api/petradar/model/petSpeciesEnum';
import { PetSexEnum } from '../api/petradar/model/petSexEnum';
import { PetSizeEnum } from '../api/petradar/model/petSizeEnum';

export type PetDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; pet: UserPetViewModel };

@Component({
  selector: 'app-pet-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  templateUrl: './pet-dialog.component.html',
})
export class PetDialogComponent {
  private fb = inject(FormBuilder);
  private petsApi = inject(UserPetsService);
  private snack = inject(MatSnackBar);

  saving = false;

  speciesOptions = Object.values(PetSpeciesEnum);
  sexOptions = Object.values(PetSexEnum);
  sizeOptions = Object.values(PetSizeEnum);

  form = this.fb.group({
    // create requiere userId
    userId: [null as number | null, [Validators.required]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    species: [null as PetSpeciesEnum | null, [Validators.required]],

    breed: ['' as string | null],
    color: ['' as string | null],
    sex: [null as PetSexEnum | null],
    size: [null as PetSizeEnum | null],
    birthDate: ['' as string | null],          // string ISO o yyyy-mm-dd (según backend)
    approximateAge: [null as number | null],
    weight: [null as number | null],
    description: ['' as string | null],
    isNeutered: [false as boolean | null],
    allergies: ['' as string | null],
    medicalNotes: ['' as string | null],
  });

  constructor(
    private ref: MatDialogRef<PetDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: PetDialogData
  ) {
    if (data.mode === 'edit') {
      this.form.patchValue({
        userId: data.pet.userId ?? null,
        name: data.pet.name ?? '',
        species: (data.pet as any).species ?? null,
        breed: data.pet.breed ?? null,
        color: data.pet.color ?? null,
        sex: (data.pet as any).sex ?? null,
        size: (data.pet as any).size ?? null,
        birthDate: data.pet.birthDate ?? null,
        approximateAge: data.pet.approximateAge ?? null,
        weight: data.pet.weight ?? null,
        description: data.pet.description ?? null,
        isNeutered: data.pet.isNeutered ?? null,
        allergies: data.pet.allergies ?? null,
        medicalNotes: data.pet.medicalNotes ?? null,
      });

      // En update NO existe userId (según tu modelo), pero lo dejamos visible
      // Si tu backend NO permite cambiar dueño, puedes deshabilitarlo:
      this.form.controls.userId.disable();
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
      const payload: UserPetCreateModel = {
        userId: this.form.value.userId!,
        name: this.form.value.name!,
        species: this.form.value.species!,
        breed: this.form.value.breed ?? null,
        color: this.form.value.color ?? null,
        sex: this.form.value.sex ?? undefined,
        size: this.form.value.size ?? undefined,
        birthDate: this.form.value.birthDate ?? null,
        approximateAge: this.form.value.approximateAge ?? null,
        weight: this.form.value.weight ?? null,
        description: this.form.value.description ?? null,
        isNeutered: this.form.value.isNeutered ?? null,
        allergies: this.form.value.allergies ?? null,
        medicalNotes: this.form.value.medicalNotes ?? null,
      };

      this.petsApi.apiUserPetsPost(payload).subscribe({
        next: () => {
          this.saving = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.saving = false;
          this.snack.open(err?.message ?? 'No se pudo crear', 'OK', { duration: 3500 });
        },
      });
      return;
    }

    const id = this.data.pet.id!;
    const payload: UserPetUpdateModel = {
      name: this.form.value.name ?? null,
      species: this.form.value.species ?? undefined,
      breed: this.form.value.breed ?? null,
      color: this.form.value.color ?? null,
      sex: this.form.value.sex ?? undefined,
      size: this.form.value.size ?? undefined,
      birthDate: this.form.value.birthDate ?? null,
      approximateAge: this.form.value.approximateAge ?? null,
      weight: this.form.value.weight ?? null,
      description: this.form.value.description ?? null,
      isNeutered: this.form.value.isNeutered ?? null,
      allergies: this.form.value.allergies ?? null,
      medicalNotes: this.form.value.medicalNotes ?? null,
    };

    this.petsApi.apiUserPetsIdPut(id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.ref.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err?.message ?? 'No se pudo actualizar', 'OK', { duration: 3500 });
      },
    });
  }
}
