import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { UsersPageComponent } from './users/users.page';
import { UserPetsPageComponent } from './user-pets/user-pets.page';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { authGuard } from './auth/auth.guard';
import { HeatmapPageComponent } from './heatmap/heatmap.page';
import { ReportDetailPageComponent } from './reports/report-detail-page.component';
import { MatchesPageComponent } from './matches/matches.page';
import { SystemConfigPageComponent } from './system-config/system-config.page';
import { AnalyticsPageComponent } from './analytics/analytics-page/analytics-page.component';
import { roleGuard } from './guards/role.guard';
import { ProfilePageComponent } from './profile/profile-page.component';
import { RoleEnum } from './services/permission.service';
import { LandingPage } from './landing-page/landing-page';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy';

export const routes: Routes = [
  // Public
  { path: '', component: LandingPage },
  { path: 'registro', component: RegisterComponent },
  {path: 'login', component: LoginComponent},
  { path: 'privacy-policy', component: PrivacyPolicyComponent },

  // Private 
  {
  path: 'app',
  component: DashboardLayoutComponent,
  canActivate: [authGuard],
  children: [
    {
      path: 'pets',
      component: UserPetsPageComponent,
      canActivate: [authGuard],
    },
    {
      path: 'users',
      component: UsersPageComponent,
      canActivate: [authGuard, roleGuard],
      data: {
        roles: [RoleEnum.Admin, RoleEnum.SuperAdmin],
      },
    },
    {
      path: 'heatmap',
      component: HeatmapPageComponent,
      canActivate: [authGuard, roleGuard],
      data: {
        roles: [RoleEnum.Organization, RoleEnum.Admin, RoleEnum.SuperAdmin],
      },
    },
    {
      path: 'matches',
      component: MatchesPageComponent,
      canActivate: [authGuard, roleGuard],
      data: {
        roles: [RoleEnum.Admin, RoleEnum.SuperAdmin],
      },
    },
    {
      path: 'reports/:id',
      component: ReportDetailPageComponent,
      canActivate: [authGuard],
    },
    {
      path: 'system-config',
      component: SystemConfigPageComponent,
      canActivate: [authGuard, roleGuard],
      data: {
        roles: [RoleEnum.SuperAdmin],
      },
    },
    {
      path: 'analytics',
      component: AnalyticsPageComponent,
      canActivate: [authGuard, roleGuard],
      data: {
        roles: [RoleEnum.Organization, RoleEnum.Admin, RoleEnum.SuperAdmin],
      },
    },
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'pets',
    },

    {
      path: 'profile',
      component: ProfilePageComponent,
      canActivate: [authGuard, roleGuard],
      data: {
        roles: [
          RoleEnum.User,
          RoleEnum.Organization,
          RoleEnum.Admin,
          RoleEnum.SuperAdmin
        ],
      },
    },
  ],
}
  { path: '**', redirectTo: 'login' },
];

