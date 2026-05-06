import { Injectable } from '@angular/core';

export enum RoleEnum {
  User = 'User',
  Organization = 'Organization',
  Admin = 'Admin',
  SuperAdmin = 'SuperAdmin'
}

export type PermissionKey =
  | 'canViewUsers'
  | 'canCreateUsers'
  | 'canViewReports'
  | 'canDeleteReports'
  | 'canViewHeatmap'
  | 'canViewMatches'
  | 'canConfigureSystem'
  | 'canViewProfile'
  | 'canViewDonations';

const RolePermissions: Record<RoleEnum, Record<PermissionKey, boolean>> = {
  [RoleEnum.SuperAdmin]: {
    canViewUsers: true,
    canCreateUsers: true,
    canViewReports: true,
    canDeleteReports: true,
    canViewHeatmap: true,
    canViewMatches: true,
    canConfigureSystem: true,
    canViewProfile: true,
    canViewDonations: true
  },

  [RoleEnum.Admin]: {
    canViewUsers: true,
    canCreateUsers: true,
    canViewReports: true,
    canDeleteReports: true,
    canViewHeatmap: true,
    canViewMatches: true,
    canConfigureSystem: false,
    canViewProfile: true,
    canViewDonations: true
  },

  [RoleEnum.Organization]: {
    canViewUsers: false,
    canCreateUsers: false,
    canViewReports: true,
    canDeleteReports: false,
    canViewHeatmap: true,
    canViewMatches: false,
    canConfigureSystem: false,
    canViewProfile: true,
    canViewDonations: true
  },

  [RoleEnum.User]: {
    canViewUsers: false,
    canCreateUsers: false,
    canViewReports: true,
    canDeleteReports: false,
    canViewHeatmap: false,
    canViewMatches: false,
    canConfigureSystem: false,
    canViewProfile: true,
    canViewDonations: true
  }
};

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  can(role: RoleEnum | string | null | undefined, permission: PermissionKey): boolean {
    if (!role || !this.isValidRole(role)) {
      return false;
    }

    return RolePermissions[role][permission] ?? false;
  }

  canEditUser(currentRole: RoleEnum | string | null | undefined, targetRole: RoleEnum | string | null | undefined): boolean {
    if (!this.isValidRole(currentRole) || !this.isValidRole(targetRole)) {
      return false;
    }

    if (currentRole === RoleEnum.SuperAdmin) {
      return true;
    }

    if (currentRole === RoleEnum.Admin) {
      return targetRole !== RoleEnum.SuperAdmin;
    }

    return false;
  }

  canDeleteUser(currentRole: RoleEnum | string | null | undefined, targetRole: RoleEnum | string | null | undefined): boolean {
    if (!this.isValidRole(currentRole) || !this.isValidRole(targetRole)) {
      return false;
    }

    if (currentRole === RoleEnum.SuperAdmin) {
      return true;
    }

    if (currentRole === RoleEnum.Admin) {
      return targetRole !== RoleEnum.SuperAdmin;
    }

    return false;
  }

  canCreateRole(currentRole: RoleEnum | string | null | undefined, roleToCreate: RoleEnum | string | null | undefined): boolean {
    if (!this.isValidRole(currentRole) || !this.isValidRole(roleToCreate)) {
      return false;
    }

    if (currentRole === RoleEnum.SuperAdmin) {
      return true;
    }

    if (currentRole === RoleEnum.Admin) {
      return roleToCreate !== RoleEnum.SuperAdmin;
    }

    return false;
  }

  getCreatableRoles(currentRole: RoleEnum | string | null | undefined): RoleEnum[] {
    if (!this.isValidRole(currentRole)) {
      return [];
    }

    if (currentRole === RoleEnum.SuperAdmin) {
      return [
        RoleEnum.User,
        RoleEnum.Organization,
        RoleEnum.Admin,
        RoleEnum.SuperAdmin
      ];
    }

    if (currentRole === RoleEnum.Admin) {
      return [
        RoleEnum.User,
        RoleEnum.Organization,
        RoleEnum.Admin
      ];
    }

    return [];
  }

  private isValidRole(role: unknown): role is RoleEnum {
    return Object.values(RoleEnum).includes(role as RoleEnum);
  }
}