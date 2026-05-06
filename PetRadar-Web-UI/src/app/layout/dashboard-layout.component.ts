import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import {
  PermissionService,
  PermissionKey,
  RoleEnum
} from '../services/permission.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="app-wrapper">
    <nav class="app-header navbar navbar-expand bg-body">
      <div class="container-fluid">
        <ul class="navbar-nav">
          <li class="nav-item">
            <button
              type="button"
              class="nav-link btn btn-link px-2"
              (click)="toggleSidebar()">
              <i class="fas fa-bars"></i>
            </button>
          </li>

          <li class="nav-item d-none d-md-block">
            <a class="nav-link fw-semibold" routerLink="/app/pets">PetRadar</a>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <button type="button" class="btn btn-outline-danger btn-sm" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i> Salir
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <aside class="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
      <div class="sidebar-brand">
        <a class="brand-link" routerLink="/app/pets">
          <span class="brand-text fw-light">PetRadar</span>
        </a>
      </div>

      <div class="sidebar-wrapper">
        <nav class="mt-2">
          <ul class="nav sidebar-menu flex-column" role="menu" data-lte-toggle="treeview" data-accordion="false">

            <li class="nav-item" *ngIf="can('canViewUsers')">
              <a class="nav-link" routerLink="/app/users" routerLinkActive="active">
                <i class="nav-icon fas fa-users"></i>
                <p>Usuarios</p>
              </a>
            </li>

            <li class="nav-item">
              <a class="nav-link" routerLink="/app/pets" routerLinkActive="active">
                <i class="nav-icon fas fa-paw"></i>
                <p>Mascotas</p>
              </a>
            </li>

            <li class="nav-item" *ngIf="can('canViewHeatmap')">
              <a routerLink="/app/heatmap" routerLinkActive="active" class="nav-link">
                <i class="nav-icon fas fa-fire"></i>
                <p>Mapa de calor</p>
              </a>
            </li>

            <li class="nav-item" *ngIf="can('canViewMatches')">
              <a routerLink="/app/matches" routerLinkActive="active" class="nav-link">
                <i class="nav-icon fas fa-link"></i>
                <p>Matches</p>
              </a>
            </li>

            <li class="nav-item" *ngIf="can('canConfigureSystem')">
              <a routerLink="/app/system-config" routerLinkActive="active" class="nav-link">
                <i class="nav-icon fa-solid fa-sliders"></i>
                <p>Configuración</p>
              </a>
            </li>

            <li class="nav-item" *ngIf="can('canViewHeatmap')">
              <a routerLink="/app/analytics"
                routerLinkActive="active"
                class="nav-link">
                <i class="nav-icon fas fa-chart-pie"></i>
                <p>Analítica</p>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/app/profile" routerLinkActive="active">
                <i class="nav-icon fas fa-user"></i>
                <p>Mi perfil</p>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <main class="app-main">
      <div class="app-content">
        <div class="container-fluid">
          <router-outlet></router-outlet>
        </div>
      </div>
    </main>
  </div>
`,
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  currentUserRole: RoleEnum | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    document.body.classList.add('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');
    this.loadCurrentUserRole();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');
  }

  can(permission: PermissionKey): boolean {
    return this.permissionService.can(this.currentUserRole, permission);
  }

  private loadCurrentUserRole(): void {
    this.currentUserRole = this.getRoleFromToken();

    console.log('CURRENT ROLE:', this.currentUserRole);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

  toggleSidebar(): void {
    document.body.classList.toggle('sidebar-collapse');
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


}