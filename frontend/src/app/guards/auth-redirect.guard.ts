import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import {AuthService} from '../services/auth/auth.service';

export const authRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Redirect authenticated users to the dashboard
    return router.parseUrl('/items');
  }

  // Allow unauthenticated users to access the login page
  return true;
};
