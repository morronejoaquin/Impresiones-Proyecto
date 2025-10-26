import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/Users/user-service';
import { inject } from '@angular/core';

// roles validos
type Role = 'admin' | 'guest' | 'registered';

export const permissionGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  // 1. Obtener los roles permitidos definidos en la ruta (data)
  // Si no se define 'allowedRoles', por defecto asumimos que solo requiere autenticación
  const allowedRoles = route.data['allowedRoles'] as Role[] | undefined;

  // 2. Obtener el rol actual del usuario
  const userRole = userService.getUserRole();
  
  // Si la ruta no requiere ningún rol específico, pero requiere autenticación (ya cubierta por authGuard), 
  // o si el usuario no tiene rol (no logueado) y la ruta requiere roles, redirigir.
  if (!userRole) {
    // Si no está logueado, siempre debe ir al login, excepto si es una ruta pública.
    // Si no hay rol y la ruta es protegida, redirige al login.
    return router.createUrlTree(['/user-login']);
  }

  // Si no hay roles permitidos definidos, pero el usuario está aquí, se asume que
  // la ruta es abierta a cualquier usuario logueado o que la regla es simple. 
  // Sin embargo, para este caso específico, usaremos roles.
  if (!allowedRoles || allowedRoles.length === 0) {
      // Si la ruta no especifica roles, se asume que solo requiere que el usuario exista (estar logueado).
      return !!userService.getLoggedInUser() || router.createUrlTree(['/user-login']);
  }

  // 3. Comprobar si el rol del usuario está incluido en los roles permitidos
  if (allowedRoles.includes(userRole)) {
    return true; // Acceso permitido
  } else {
    console.warn(`Acceso denegado: El usuario con rol '${userRole}' no puede acceder a esta ruta.`);
    // redirige a una página de "Acceso Denegado"
    return router.createUrlTree(['/user-login']); 
  }
};
