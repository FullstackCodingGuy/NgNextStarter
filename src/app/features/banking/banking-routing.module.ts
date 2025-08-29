import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [PermissionGuard],
    data: { permissionsAll: ['banking.read'] },
    children: [
      {
        path: 'accounts',
        canActivate: [PermissionGuard],
  data: { permissionsAll: ['banking.read'], constrainedPage: true },
        loadComponent: () => import('./pages/accounts/accounts-list.component').then(m => m.AccountsListComponent)
      },
      {
        path: 'transactions',
        canActivate: [PermissionGuard],
  data: { permissionsAll: ['banking.read'], overlaySidenav: true },
        loadComponent: () => import('./pages/transactions/transactions-list.component').then(m => m.TransactionsListComponent)
      },
      {
        path: 'transactions/new',
        canActivate: [PermissionGuard],
  data: { permissionsAll: ['banking.read','banking.write'], constrainedPage: true },
        loadComponent: () => import('./pages/transactions/transaction-new.component').then(m => m.TransactionNewComponent)
      },
      {
        path: 'transactions/:id',
        canActivate: [PermissionGuard],
  data: { permissionsAll: ['banking.read'], overlaySidenav: true },
        loadComponent: () => import('./pages/transactions/transaction-detail.component').then(m => m.TransactionDetailComponent)
      },
      {
        path: 'balances',
        canActivate: [PermissionGuard],
  data: { permissionsAll: ['banking.read'], constrainedPage: true },
        loadComponent: () => import('./pages/balances/balances.component').then(m => m.BalancesComponent)
      },
      { path: '', pathMatch: 'full', redirectTo: 'accounts' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BankingRoutingModule {}
