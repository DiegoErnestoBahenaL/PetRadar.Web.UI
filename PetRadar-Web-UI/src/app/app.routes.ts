import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { UsersPageComponent } from './users/users.page';
import { UserPetsPageComponent } from './user-pets/user-pets.page';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { authGuard } from './auth/auth.guard';
import { HeatmapPageComponent } from './heatmap/heatmap.page';

export const routes: Routes = [
  // Public
  { path: '', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },

  // Private 
  {
    path: 'app',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'pets', component: UserPetsPageComponent, canActivate: [authGuard] },
      { path: 'users', component: UsersPageComponent, canActivate: [authGuard] },
      { path: 'heatmap', component: HeatmapPageComponent, canActivate: [authGuard] },
      { path: '', pathMatch: 'full', redirectTo: 'users' },
    ],
  },

  { path: '**', redirectTo: '' },
];

