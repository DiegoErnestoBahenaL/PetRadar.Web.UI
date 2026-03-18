import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserPetsService } from '../api/petradar/api/userPets.service';
import { UserPetCreateModel } from '../api/petradar/model/userPetCreateModel';
import { UserPetUpdateModel } from '../api/petradar/model/userPetUpdateModel';
import { UserPetViewModel } from '../api/petradar/model/userPetViewModel';

import { PetSpeciesEnum } from '../api/petradar/model/petSpeciesEnum';
import { PetSexEnum } from '../api/petradar/model/petSexEnum';
import { PetSizeEnum } from '../api/petradar/model/petSizeEnum';

import { ViewChild, ElementRef } from '@angular/core';

export type PetDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; pet: UserPetViewModel };

@Component({
  selector: 'app-pet-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pet-dialog.component.html',
})
export class PetDialogComponent {

  @ViewChild('basic') basicDetails!: ElementRef<HTMLDetailsElement>;
  @ViewChild('physical') physicalDetails!: ElementRef<HTMLDetailsElement>;
  @ViewChild('health') healthDetails!: ElementRef<HTMLDetailsElement>;
  onSectionToggle(section: 'basic' | 'physical' | 'health', isOpen: boolean) {
    // se abre una sección
    if (!isOpen) return;

    const all = {
      basic: this.basicDetails?.nativeElement,
      physical: this.physicalDetails?.nativeElement,
      health: this.healthDetails?.nativeElement,
    };

    Object.entries(all).forEach(([key, el]) => {
      if (!el) return;
      if (key !== section) el.open = false; // ccerrar pestañas
    });
  }

  private fb = inject(FormBuilder);
  private petsApi = inject(UserPetsService);

  @Input() open = false;
  @Input() set data(value: PetDialogData | null) {
    this._data = value;
    this.initFromData();
  }
  get data() { return this._data; }
  private _data: PetDialogData | null = null;

  @Output() closed = new EventEmitter<boolean>();

  saving = false;
  errorMsg: string | null = null;

  speciesOptions = Object.values(PetSpeciesEnum);
  sexOptions = Object.values(PetSexEnum);
  sizeOptions = Object.values(PetSizeEnum);

  form = this.fb.group({
    userId: [null as number | null, [Validators.required]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    species: [null as PetSpeciesEnum | null, [Validators.required]],

    breed: ['' as string | null],
    color: ['' as string | null],
    sex: [null as PetSexEnum | null],
    size: [null as PetSizeEnum | null],
    birthDate: ['' as string | null],
    approximateAge: [null as number | null],
    weight: [null as number | null],
    description: ['' as string | null],
    isNeutered: [false as boolean | null],
    allergies: ['' as string | null],
    medicalNotes: ['' as string | null],
  });

  private initFromData() {
    this.errorMsg = null;

    if (!this._data) return;

    if (this._data.mode === 'edit') {
      const pet = this._data.pet;
      this.form.patchValue({
        userId: pet.userId ?? null,
        name: pet.name ?? '',
        species: (pet as any).species ?? null,
        breed: pet.breed ?? null,
        color: pet.color ?? null,
        sex: (pet as any).sex ?? null,
        size: (pet as any).size ?? null,
        birthDate: pet.birthDate ?? null,
        approximateAge: pet.approximateAge ?? null,
        weight: pet.weight ?? null,
        description: pet.description ?? null,
        isNeutered: pet.isNeutered ?? null,
        allergies: pet.allergies ?? null,
        medicalNotes: pet.medicalNotes ?? null,
      });

      this.form.controls.userId.disable();
    } else {
      this.form.reset({ isNeutered: false });
      this.form.controls.userId.enable();
    }
  }

  close(ok: boolean = false) {
    if (this.saving) return;
    this.closed.emit(ok);
  }

  save() {
    if (!this._data) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMsg = null;

    if (this._data.mode === 'create') {
      const payload: UserPetCreateModel = {
        userId: this.form.getRawValue().userId!,
        name: this.form.getRawValue().name!,
        species: this.form.getRawValue().species!,
        breed: this.form.getRawValue().breed ?? null,
        color: this.form.getRawValue().color ?? null,
        sex: this.form.getRawValue().sex ?? undefined,
        size: this.form.getRawValue().size ?? undefined,
        birthDate: this.form.getRawValue().birthDate ?? null,
        approximateAge: this.form.getRawValue().approximateAge ?? null,
        weight: this.form.getRawValue().weight ?? null,
        description: this.form.getRawValue().description ?? null,
        isNeutered: this.form.getRawValue().isNeutered ?? null,
        allergies: this.form.getRawValue().allergies ?? null,
        medicalNotes: this.form.getRawValue().medicalNotes ?? null,
      };

      this.petsApi.apiUserPetsPost(payload).subscribe({
        next: () => { this.saving = false; this.close(true); },
        error: (err) => { this.saving = false; this.errorMsg = err?.message ?? 'No se pudo crear'; },
      });
      return;
    }

    const id = this._data.pet.id!;
    const payload: UserPetUpdateModel = {
      name: this.form.getRawValue().name ?? null,
      species: this.form.getRawValue().species ?? undefined,
      breed: this.form.getRawValue().breed ?? null,
      color: this.form.getRawValue().color ?? null,
      sex: this.form.getRawValue().sex ?? undefined,
      size: this.form.getRawValue().size ?? undefined,
      birthDate: this.form.getRawValue().birthDate ?? null,
      approximateAge: this.form.getRawValue().approximateAge ?? null,
      weight: this.form.getRawValue().weight ?? null,
      description: this.form.getRawValue().description ?? null,
      isNeutered: this.form.getRawValue().isNeutered ?? null,
      allergies: this.form.getRawValue().allergies ?? null,
      medicalNotes: this.form.getRawValue().medicalNotes ?? null,
    };

    this.petsApi.apiUserPetsIdPut(id, payload).subscribe({
      next: () => { this.saving = false; this.close(true); },
      error: (err) => { this.saving = false; this.errorMsg = err?.message ?? 'No se pudo actualizar'; },
    });
  }
}