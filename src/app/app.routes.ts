import { Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard } from './core/guards/auth.guard';
import { UserRole } from './core/models/user.model';
import { UnauthorizedComponent } from './shared/components/unauthorized.component';
import { GlobalStateDemoComponent } from './shared/components/global-state-demo.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { PermissionGuard } from './core/guards/permission.guard';

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
  data: { constrainedPage: true },
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
    path: 'global-state-demo',
    canActivate: [AuthGuard],
    component: MainLayoutComponent,
    children: [
      { path: '', component: GlobalStateDemoComponent }
    ]
  },
  {
    path: 'banking',
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissionsAll: ['banking.read'] },
    loadChildren: () => import('./features/banking/banking.module').then(m => m.BankingModule)
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  // Dev-only visual QA route: renders the app shell for screenshots
  {
    path: 'dev/shell-preview',
    loadComponent: () => import('./dev/shell-preview/shell-preview.component').then(c => c.ShellPreviewComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
