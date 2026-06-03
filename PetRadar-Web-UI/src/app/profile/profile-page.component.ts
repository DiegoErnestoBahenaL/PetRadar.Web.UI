import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title mb-0">
          <i class="fas fa-user me-2"></i>
          Mi perfil
        </h3>
      </div>
    <div class="profile-header-card shadow-sm">

    <div class="profile-avatar-container">
        <img
            *ngIf="profilePictureUrl && !imageError"
            [src]="profilePictureUrl"
            (error)="onImageError()"
            alt="Foto de perfil"
            class="profile-avatar"
            />

        <div
            *ngIf="!profilePictureUrl || imageError"
            class="profile-avatar-placeholder">
            <i class="fas fa-user"></i>
        </div>
    </div>

    <div class="profile-user-info">
        <h3 class="profile-name mb-1">
        {{ displayName }}
        </h3>

        <div class="profile-meta">
        <div class="profile-meta-item">
            <span class="profile-label">ID</span>
            <span>{{ userId ?? 'N/D' }}</span>
        </div>

        <div class="profile-meta-item">
            <span class="profile-label">Correo</span>
            <span>{{ email ?? 'No disponible' }}</span>
        </div>

        <div class="profile-meta-item">
            <span class="profile-label">Rol</span>

            <span class="badge rounded-pill text-bg-light border">
            {{ role ?? 'N/D' }}
            </span>
        </div>
        </div>
    </div>

    </div>

      <div class="card-body">
        <div class="row g-3">
            <div class="col-md-4">
                <div class="card shadow-sm border-0 h-100 profile-card">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                    <div class="profile-icon me-3">
                        <i class="fas fa-user"></i>
                    </div>

                    <div>
                        <h5 class="mb-0">Perfil</h5>
                        <small class="text-muted">
                        Información de tu cuenta
                        </small>
                    </div>
                    </div>

                    <p class="text-muted mb-0">
                    Consulta tu información personal.
                    </p>
                </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card shadow-sm border-0 h-100 profile-card">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                    <div class="profile-icon me-3">
                        <i class="fas fa-paw"></i>
                    </div>

                    <div>
                        <h5 class="mb-0">Mis mascotas</h5>
                        <small class="text-muted">
                        Mascotas registradas
                        </small>
                    </div>
                    </div>

                    <p class="text-muted mb-0">
                    Visualiza las mascotas asociadas a tu cuenta.
                    </p>
                </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card shadow-sm border-0 h-100 profile-card">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                    <div class="profile-icon me-3">
                        <i class="fas fa-clipboard-list"></i>
                    </div>

                    <div>
                        <h5 class="mb-0">Mis reportes</h5>
                        <small class="text-muted">
                        Actividad reciente
                        </small>
                    </div>
                    </div>

                    <p class="text-muted mb-0">
                    Consulta reportes y actividad relacionada.
                    </p>
                </div>
                </div>
            </div>

            </div>

        </div>

        <hr>

        <div class="row mt-4">
            <div class="col-12">
              <div class="profile-form-card">
                <div class="profile-form-header">
                  <div class="profile-form-icon">
                    <i class="fas fa-user-edit"></i>
                  </div>

                  <div>
                    <h5 class="mb-0">Editar información de perfil</h5>
                    <small>Actualiza tus datos personales y de contacto.</small>
                  </div>
                </div>

                <div class="profile-form-body">
                  <div *ngIf="errorMessage" class="alert alert-danger">
                    {{ errorMessage }}
                  </div>

                  <div *ngIf="successMessage" class="alert alert-success">
                    {{ successMessage }}
                  </div>

                  <form [formGroup]="profileForm">
                    <div class="profile-form-section">
                      <div class="profile-section-title">
                        Datos personales
                      </div>

                      <div class="row g-3">
                        <div class="col-md-6">
                          <label class="profile-form-label">Nombre</label>
                          <input class="form-control profile-input" formControlName="name" />
                        </div>

                        <div class="col-md-6">
                          <label class="profile-form-label">Apellido</label>
                          <input class="form-control profile-input" formControlName="lastName" />
                        </div>

                        <div class="col-md-6">
                          <label class="profile-form-label">Teléfono</label>
                          <input class="form-control profile-input" formControlName="phoneNumber" />
                        </div>

                        <div class="col-md-6">
                          <label class="profile-form-label">Nueva contraseña</label>
                          <input
                            type="password"
                            class="form-control profile-input"
                            formControlName="password"
                            placeholder="Dejar vacío para conservar la actual"
                          />
                          <small class="profile-help-text">
                            Opcional. Solo se actualizará si escribes una nueva contraseña.
                          </small>
                        </div>
                      </div>
                    </div>

                    <div class="profile-form-section mt-4" *ngIf="role === 'Organization'">
                      <div class="profile-section-title">
                        Datos de organización
                      </div>

                      <div class="row g-3">
                        <div class="col-md-6">
                          <label class="profile-form-label">Nombre de organización</label>
                          <input class="form-control profile-input" formControlName="organizationName" />
                        </div>

                        <div class="col-md-6">
                          <label class="profile-form-label">Teléfono organización</label>
                          <input class="form-control profile-input" formControlName="organizationPhone" />
                        </div>

                        <div class="col-12">
                          <label class="profile-form-label">Dirección organización</label>
                          <input class="form-control profile-input" formControlName="organizationAddress" />
                        </div>
                      </div>
                    </div>

                    <div class="profile-form-actions">
                      <button
                        type="button"
                        class="btn profile-save-btn"
                        (click)="saveProfile()"
                      >
                        <i class="fas fa-save me-1"></i>
                        Guardar cambios
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
        </div>

        <div class="row mt-4">
          <div class="col-md-6">
            <div class="card card-outline card-success profile-data-card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h3 class="card-title mb-0">Mis mascotas</h3>
                <span class="badge text-bg-light border">{{ pets.length }} registradas</span>
              </div>

              <div class="card-body">
                <p *ngIf="isLoadingPets">Cargando mascotas...</p>

                <div *ngIf="!isLoadingPets && pets.length === 0" class="text-muted">
                  No tienes mascotas registradas.
                </div>

                <div class="profile-mini-list" *ngIf="pets.length > 0">
                  <div class="profile-mini-item" *ngFor="let pet of pagedPets">
                    <div>
                      <strong>{{ pet.name || 'Mascota sin nombre' }}</strong>
                      <small>
                        {{ getSpeciesLabel(pet.species) }}
                        <span *ngIf="pet.breed"> · {{ pet.breed }}</span>
                      </small>
                    </div>

                    <div class="profile-mini-meta">
                      <span>{{ pet.color || 'Sin color' }}</span>
                      <span>{{ pet.sex || 'Sin sexo' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer d-flex justify-content-between align-items-center" *ngIf="pets.length > petPageSize">
                <span class="text-muted small">
                  Página {{ petPage }} de {{ petTotalPages }}
                </span>

                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary" (click)="prevPetPage()" [disabled]="petPage <= 1">
                    Anterior
                  </button>

                  <button class="btn btn-outline-secondary" (click)="nextPetPage()" [disabled]="petPage >= petTotalPages">
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card card-outline card-warning profile-data-card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h3 class="card-title mb-0">Mis reportes</h3>
                <span class="badge text-bg-light border">{{ reports.length }} registrados</span>
              </div>

              <div class="card-body">
                <p *ngIf="isLoadingReports">Cargando reportes...</p>

                <div *ngIf="!isLoadingReports && reports.length === 0" class="text-muted">
                  No tienes reportes registrados.
                </div>

                <div class="profile-mini-list" *ngIf="reports.length > 0">
                  <div class="profile-mini-item" *ngFor="let report of pagedReports">
                    <div>
                      <strong>
                        Reporte #{{ report.id ?? 'N/D' }} · {{ getReportTypeLabel(report.reportType) }}
                      </strong>

                      <small>
                        {{ getSpeciesLabel(report.species) }}
                        <span *ngIf="report.breed"> · {{ report.breed }}</span>
                      </small>
                    </div>

                    <div class="profile-mini-meta">
                      <span>{{ getReportStatusLabel(report.reportStatus) }}</span>
                      <span>{{ report.incidentDate ? (report.incidentDate | date:'dd/MM/yyyy') : 'Sin fecha' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer d-flex justify-content-between align-items-center" *ngIf="reports.length > reportPageSize">
                <span class="text-muted small">
                  Página {{ reportPage }} de {{ reportTotalPages }}
                </span>

                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary" (click)="prevReportPage()" [disabled]="reportPage <= 1">
                    Anterior
                  </button>

                  <button class="btn btn-outline-secondary" (click)="nextReportPage()" [disabled]="reportPage >= reportTotalPages">
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  `,
styles: [`
  .profile-card {
    background: #ffffff;
    border-radius: 14px;
    transition: all 0.2s ease;
  }

  .profile-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgba(0,0,0,.08) !important;
  }

  .profile-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #f4f6f9;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #495057;
    font-size: 1.1rem;
  }

   .profile-header-card {
    background: #fff;
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    gap: 1.5rem;
    align-items: center;
    margin-bottom: 1.5rem;
    border: 1px solid #e9ecef;
  }

  .profile-avatar-container {
    flex-shrink: 0;
  }

  .profile-avatar,
  .profile-avatar-placeholder {
    width: 110px;
    height: 110px;
    border-radius: 18px;
    object-fit: cover;
    background: #f4f6f9;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid #dee2e6;
  }

  .profile-avatar-placeholder i {
    font-size: 2rem;
    color: #6c757d;
  }

  .profile-user-info {
    flex: 1;
    min-width: 0;
  }

  .profile-name {
    font-weight: 600;
    color: #212529;
  }

  .profile-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.75rem;
  }

  .profile-meta-item {
    display: flex;
    flex-direction: column;
    min-width: 180px;
  }

  .profile-label {
    font-size: 0.8rem;
    color: #6c757d;
    margin-bottom: 0.15rem;
  }

  @media (max-width: 768px) {
    .profile-header-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .profile-avatar,
    .profile-avatar-placeholder {
      width: 90px;
      height: 90px;
    }

    .profile-meta {
      flex-direction: column;
      gap: 0.75rem;
    }

    .profile-meta-item {
      min-width: unset;
    }

  
  }
  .profile-spec-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: .75rem;
}

.profile-spec-grid div {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: .75rem .85rem;
}

.profile-spec-grid span {
  display: block;
  font-size: .7rem;
  color: #64748b;
  font-weight: 800;
  text-transform: uppercase;
}

.profile-spec-grid strong {
  display: block;
  margin-top: .15rem;
  color: #0f172a;
  font-weight: 650;
}

.profile-edit-form {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 1rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, .06);
}

@media (max-width: 992px) {
  .profile-spec-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 576px) {
  .profile-spec-grid {
    grid-template-columns: 1fr;
  }
}

.profile-data-card {
  border-radius: 16px;
  overflow: hidden;
}

.profile-mini-list {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

.profile-mini-item {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: .85rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.profile-mini-item strong {
  display: block;
  color: #0f172a;
  font-weight: 700;
}

.profile-mini-item small {
  display: block;
  color: #64748b;
  margin-top: .15rem;
}

.profile-mini-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .25rem;
  font-size: .8rem;
  color: #475569;
  white-space: nowrap;
}

.profile-form-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(15, 23, 42, .06);
}

.profile-form-header {
  display: flex;
  align-items: center;
  gap: .85rem;
  padding: 1rem 1.15rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e5e7eb;
}

.profile-form-header h5 {
  font-weight: 750;
  color: #0f172a;
}

.profile-form-header small {
  color: #64748b;
}

.profile-form-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #eff6ff;
  color: #0d6efd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.profile-form-body {
  padding: 1.15rem;
}

.profile-form-section {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 1rem;
}

.profile-section-title {
  font-size: .72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: #64748b;
  margin-bottom: .8rem;
}

.profile-form-label {
  display: block;
  font-size: .78rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: .35rem;
}

.profile-input {
  border-radius: 12px;
  border-color: #dbe3ef;
  min-height: 42px;
  font-weight: 500;
}

.profile-input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 .2rem rgba(13, 110, 253, .12);
}

.profile-help-text {
  display: block;
  margin-top: .3rem;
  color: #64748b;
  font-size: .78rem;
}

.profile-form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
}

.profile-save-btn {
  border-radius: 12px;
  font-weight: 700;
  padding: .55rem 1rem;
  color: #0d6efd;
  background: #ffffff;
  border: 1px solid #bfdbfe;
  transition: all .15s ease-in-out;
}

.profile-save-btn:hover {
  background: #eff6ff;
  border-color: #60a5fa;
  transform: translateY(-1px);
  box-shadow: 0 .35rem .85rem rgba(15, 23, 42, .08);
}
`]
})


export class ProfilePageComponent {
  userId: number | null = null;
  email: string | null = null;
  role: string | null = null;
  profilePictureUrl: string | null = null;
  imageError = false
  displayName: string | null = null;
  
  private fb = inject(FormBuilder);


  user: any = null;
  errorMessage = '';
  successMessage = '';

  private buildProfilePictureUrl(): void {
    if (!this.userId) {
        this.profilePictureUrl = null;
        return;
    }

    this.profilePictureUrl =
        `https://api-qa.petradar-qa.org/api/Users/${this.userId}/profilepicture`;
    }

  private loadUserFromToken(): void {
    const token = localStorage.getItem('token');

    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      this.userId =
        Number(
          payload.userId ??
          payload.UserId ??
          payload.nameid ??
          payload.sub ??
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        ) || null;

      this.email =
        payload.email ??
        payload.Email ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
        null;

      this.role =
        payload.role ??
        payload.Role ??
        payload.roles?.[0] ??
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        null;

    this.displayName =
        payload.unique_name ??
        payload.name ??
        payload.email ??
        'Usuario';

    

      console.log('PROFILE TOKEN DATA:', {
        userId: this.userId,
        email: this.email,
        role: this.role
      });
    } catch {
      this.userId = null;
      this.email = null;
      this.role = null;
    }

    this.profileForm.patchValue({
      name: this.user?.name ?? '',
      lastName: this.user?.lastName ?? '',
      phoneNumber: this.user?.phoneNumber ?? '',
      organizationName: this.user?.organizationName ?? '',
      organizationAddress: this.user?.organizationAddress ?? '',
      organizationPhone: this.user?.organizationPhone ?? '',
    });
  }

  private loadProfilePicture(): void {
    if (!this.userId) {
        return;
    }

    this.http
        .get(`https://api-qa.petradar-qa.org/api/Users/${this.userId}/profilepicture`, {
        responseType: 'blob'
        })
        .subscribe({
        next: (blob) => {
            this.profilePictureUrl = URL.createObjectURL(blob);
            this.imageError = false;
        },
        error: (err) => {
            console.error('Error loading profile picture:', err);
            this.profilePictureUrl = null;
            this.imageError = true;
        }
        });
    }

    profileForm = this.fb.group({
      name: [''],
      lastName: [''],
      phoneNumber: [''],
      organizationName: [''],
      organizationAddress: [''],
      organizationPhone: [''],
      password: [''],
    });

    private loadProfile(): void {
      if (!this.userId) return;

      this.http.get<any>(`https://api-qa.petradar-qa.org/api/Users/${this.userId}`)
        .subscribe({
          next: (data) => {
            this.user = data;

            this.profileForm.patchValue({
              name: data?.name ?? '',
              lastName: data?.lastName ?? '',
              phoneNumber: data?.phoneNumber ?? '',
              organizationName: data?.organizationName ?? '',
              organizationAddress: data?.organizationAddress ?? '',
              organizationPhone: data?.organizationPhone ?? '',
              password: '',
            });

            this.displayName =
              [data?.name, data?.lastName].filter(Boolean).join(' ') ||
              data?.email ||
              this.email ||
              'Usuario';
          },
          error: () => {
            this.errorMessage = 'No fue posible cargar el perfil completo.';
          },
        });
    }

    
  pets: any[] = [];
  reports: any[] = [];

  isLoadingPets = false;
  isLoadingReports = false;

  constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.loadUserFromToken();
        

        if (this.userId) {
            this.loadUserPets();
            this.loadProfile();
            this.loadUserReports();
            this.loadProfilePicture();
        }
    }

    onImageError(): void {
        this.imageError = true;
    }

    private loadUserPets(): void {
    this.isLoadingPets = true;

    this.http.get<any[]>(`https://api-qa.petradar-qa.org/api/UserPets/user/${this.userId}`)
        .subscribe({
        next: (data) => {
            this.pets = data;
            this.isLoadingPets = false;
        },
        error: (err) => {
            console.error('Error loading pets:', err);
            this.isLoadingPets = false;
        }
        });
    }

    private loadUserReports(): void {
    this.isLoadingReports = true;

    this.http.get<any[]>(`https://api-qa.petradar-qa.org/api/Reports/user/${this.userId}`)
        .subscribe({
        next: (data) => {
            this.reports = data;
            this.isLoadingReports = false;
        },
        error: (err) => {
            console.error('Error loading reports:', err);
            this.isLoadingReports = false;
        }
        });
    }

    saveProfile(): void {
      if (!this.userId) return;

      const raw = this.profileForm.getRawValue();

      const payload: any = {
        email: this.user?.email ?? this.email,
        name: raw.name || null,
        lastName: raw.lastName || null,
        phoneNumber: raw.phoneNumber || null,
        organizationName: raw.organizationName || null,
        organizationAddress: raw.organizationAddress || null,
        organizationPhone: raw.organizationPhone || null,
        role: this.user?.role ?? this.role,
      };

      if (raw.password && raw.password.trim()) {
        payload.password = raw.password.trim();
      }

      this.http.put(`https://api-qa.petradar-qa.org/api/Users/${this.userId}`, payload)
        .subscribe({
          next: () => {
            this.profileForm.patchValue({ password: '' });
            this.loadProfile();
          },
          error: () => {
            this.errorMessage = 'No fue posible actualizar el perfil.';
          },
        });
    }

    petPage = 1;
    petPageSize = 3;

    reportPage = 1;
    reportPageSize = 4;

    get pagedPets(): any[] {
      const start = (this.petPage - 1) * this.petPageSize;
      return this.pets.slice(start, start + this.petPageSize);
    }

    get petTotalPages(): number {
      return Math.max(1, Math.ceil(this.pets.length / this.petPageSize));
    }

    get pagedReports(): any[] {
      const start = (this.reportPage - 1) * this.reportPageSize;
      return this.reports.slice(start, start + this.reportPageSize);
    }

    get reportTotalPages(): number {
      return Math.max(1, Math.ceil(this.reports.length / this.reportPageSize));
    }

    prevPetPage(): void {
      this.petPage = Math.max(1, this.petPage - 1);
    }

    nextPetPage(): void {
      this.petPage = Math.min(this.petTotalPages, this.petPage + 1);
    }

    prevReportPage(): void {
      this.reportPage = Math.max(1, this.reportPage - 1);
    }

    nextReportPage(): void {
      this.reportPage = Math.min(this.reportTotalPages, this.reportPage + 1);
    }

    getReportTypeLabel(type?: string | null): string {
      const labels: Record<string, string> = {
        Lost: 'Perdido',
        Found: 'Encontrado',
        Stray: 'Callejero',
      };

      return type ? labels[type] ?? type : 'N/D';
    }

    getReportStatusLabel(status?: string | null): string {
      const labels: Record<string, string> = {
        Active: 'Activo',
        Resolved: 'Resuelto',
        Adopted: 'Adoptado',
        Cancelled: 'Cancelado',
      };

      return status ? labels[status] ?? status : 'N/D';
    }

    getSpeciesLabel(species?: string | null): string {
      const labels: Record<string, string> = {
        Dog: 'Perro',
        Cat: 'Gato',
      };

      return species ? labels[species] ?? species : 'N/D';
    }
    }