// src/app/guards/permission.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { UserService } from '../services/Users/user-service';

// mismos roles que tu modelo
type Role = 'admin' | 'guest' | 'registered';

const LOGIN_URL = '/user-login';

export const permissionGuard: CanActivateFn = (route): boolean | UrlTree => {
  const userService = inject(UserService);
  const router = inject(Router);

  const allowedRoles: ReadonlyArray<Role> = (route.data?.['allowedRoles'] ?? []) as Role[];

  const payload = userService.getDecodedUserPayload(); 
  const userRole = userService.getUserRole() as Role | null;

  if (!payload || !userRole) return router.createUrlTree([LOGIN_URL]);

  if (allowedRoles.length === 0) return true;

  return allowedRoles.includes(userRole)
    ? true
    : router.createUrlTree([LOGIN_URL]); 
};
