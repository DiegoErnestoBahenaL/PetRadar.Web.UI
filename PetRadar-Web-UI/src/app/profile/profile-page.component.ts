import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
                    Consulta y administra tu información personal.
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
            <div class="col-md-6">
                <div class="card card-outline card-success">
                <div class="card-header">
                    <h3 class="card-title">Mis mascotas</h3>
                </div>

                <div class="card-body">
                    <p *ngIf="isLoadingPets">Cargando mascotas...</p>

                    <div *ngIf="!isLoadingPets && pets.length === 0" class="text-muted">
                    No tienes mascotas registradas.
                    </div>

                    <ul class="list-group" *ngIf="pets.length > 0">
                    <li class="list-group-item" *ngFor="let pet of pets">
                        <strong>{{ pet.name || pet.petName || 'Mascota sin nombre' }}</strong>
                        <br>
                        <small>{{ pet.species || pet.type || 'Sin especie' }}</small>
                    </li>
                    </ul>
                </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card card-outline card-warning">
                <div class="card-header">
                    <h3 class="card-title">Mis reportes</h3>
                </div>

                <div class="card-body">
                    <p *ngIf="isLoadingReports">Cargando reportes...</p>

                    <div *ngIf="!isLoadingReports && reports.length === 0" class="text-muted">
                    No tienes reportes registrados.
                    </div>

                    <ul class="list-group" *ngIf="reports.length > 0">
                    <li class="list-group-item" *ngFor="let report of reports">
                        <strong>{{ report.title || report.petName || 'Reporte sin título' }}</strong>
                        <br>
                        <small>Estado: {{ report.status || 'Sin estado' }}</small>
                    </li>
                    </ul>
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
`]
})
export class ProfilePageComponent {
  userId: number | null = null;
  email: string | null = null;
  role: string | null = null;
  profilePictureUrl: string | null = null;
  imageError = false
  displayName: string | null = null;

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

  pets: any[] = [];
  reports: any[] = [];

  isLoadingPets = false;
  isLoadingReports = false;

  constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.loadUserFromToken();
        

        if (this.userId) {
            this.loadUserPets();
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
}