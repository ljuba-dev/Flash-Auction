import { Routes } from '@angular/router';
import {authGuard} from './guards/auth.guard';
import {authRedirectGuard} from './guards/auth-redirect.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [authRedirectGuard]
  },
  {
    path: 'items',
    canActivate: [authGuard],
    loadComponent: () => import('./components/items/items.component').then(m => m.ItemsComponent),
  },
  {
    path: 'item/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/item/item.component').then(m => m.ItemComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent),
  },
  {
    path: 'user/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/user/user.component').then(m => m.UserComponent),
  },
];
