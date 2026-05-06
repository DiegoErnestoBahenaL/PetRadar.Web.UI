import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleEnum } from '../services/permission.service';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as RoleEnum[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const currentRole = getRoleFromToken();

  if (currentRole && allowedRoles.includes(currentRole)) {
    return true;
  }

  router.navigateByUrl('/app/pets');
  return false;
};

function getRoleFromToken(): RoleEnum | null {
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