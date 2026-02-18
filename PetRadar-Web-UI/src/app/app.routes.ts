import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { UsersPageComponent } from './users/users.page';
import { UserPetsPageComponent } from './user-pets/user-pets.page';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  // Public
  { path: '', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },

  // Private (dashboard)
  {
    path: 'app',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'users', component: UsersPageComponent },
      { path: 'pets', component: UserPetsPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'users' },
    ],
  },

  { path: '**', redirectTo: '' },
];

