import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'items',
    loadComponent: () => import('./components/items/items.component').then(m => m.ItemsComponent),
  },
  {
    path: 'item/:id',
    loadComponent: () => import('./components/item/item.component').then(m => m.ItemComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent),
  },
  {
    path: 'user/:id',
    loadComponent: () => import('./components/user/user.component').then(m => m.UserComponent),
  },
  { path: '', redirectTo: '/', pathMatch: 'full'},
];
