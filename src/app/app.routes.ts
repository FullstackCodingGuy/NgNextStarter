import { Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard } from './core/guards/auth.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MANAGER] },
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
  },
  {
    path: 'securities',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/securities/securities.module').then(m => m.SecuritiesModule)
  },
  {
    path: 'unauthorized',
    template: `
      <div style="text-align: center; padding: 50px;">
        <h1>Access Denied</h1>
        <p>You don't have permission to access this resource.</p>
        <a routerLink="/dashboard">Go to Dashboard</a>
      </div>
    `
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
