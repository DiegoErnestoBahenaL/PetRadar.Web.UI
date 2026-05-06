import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
  <div class="app-wrapper">
    <!-- Header -->
    <nav class="app-header navbar navbar-expand bg-body">
      <div class="container-fluid">
        <ul class="navbar-nav">
          <li class="nav-item">
            <!-- AdminLTE 4 sidebar toggle -->
            <button
              type="button"
              class="nav-link btn btn-link px-2"
              (click)="toggleSidebar()">
              <i class="fas fa-bars"></i>
            </button>
          </li>

          <li class="nav-item d-none d-md-block">
            <a class="nav-link fw-semibold" routerLink="/app/users">PetRadar</a>
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

    <!-- Sidebar -->
    <aside class="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
      <div class="sidebar-brand">
        <a class="brand-link" routerLink="/app/users">
          <span class="brand-text fw-light">PetRadar</span>
        </a>
      </div>

      <div class="sidebar-wrapper">
        <nav class="mt-2">
          <ul class="nav sidebar-menu flex-column" role="menu" data-lte-toggle="treeview" data-accordion="false">
            <li class="nav-item">
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
            <li class="nav-item">
              <a routerLink="/app/heatmap" routerLinkActive="active" class="nav-link">
                <i class="nav-icon fas fa-fire"></i>
                <p>Mapa de calor</p>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/app/matches" routerLinkActive="active" class="nav-link">
                <i class="nav-icon fas fa-link"></i>
                <p>Matches</p>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/app/system-config" class="nav-link">
                <i class="nav-icon fa-solid fa-sliders"></i>
                <p>Configuración</p>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- Main -->
    <main class="app-main">
      <!--<div class="app-content-header">
        <div class="container-fluid">
          <div class="row mb-2">
            <div class="col-sm-6">
              <h1 class="m-0">Panel</h1>
            </div>
            <div class="col-sm-6">
              <ol class="breadcrumb float-sm-end mb-0">
                <li class="breadcrumb-item"><a routerLink="/app/users">Inicio</a></li>
                <li class="breadcrumb-item active">Panel</li>
              </ol>
            </div>
          </div>
        </div>
      </div>-->

      <div class="app-content">
        <div class="container-fluid">
          <router-outlet></router-outlet>
        </div>
      </div>
    </main>

    <!-- <footer class="app-footer">
      <strong>PetRadar</strong>
    </footer>-->
  </div>
`,
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // AdminLTE 4: layout-fixed + sidebar-expand-lg son claves
    document.body.classList.add('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
  toggleSidebar() {
    document.body.classList.toggle('sidebar-collapse');
  }
}