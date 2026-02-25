import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container style="height: 100vh;">
      <mat-sidenav mode="side" opened>
        <mat-nav-list>
          <a mat-list-item routerLink="/app/users">Usuarios</a>
          <a mat-list-item routerLink="/app/pets">Mascotas</a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar>
          <span>PetRadar</span>
          <span style="flex: 1 1 auto;"></span>
          <button mat-button (click)="logout()">Salir</button>
        </mat-toolbar>

        <div style="padding: 16px;">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class DashboardLayoutComponent {
  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
    location.href = '/'; // vuelve al login
  }
}
