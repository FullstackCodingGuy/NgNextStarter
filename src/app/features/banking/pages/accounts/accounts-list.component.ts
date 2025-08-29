import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AccountsFacade } from '../../state/accounts.facade';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BankAccount } from '../../data/models';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatPaginatorModule],
  template: `
  <div class="page-container">
    <!-- Header full width -->
    <div class="page-card">
      <header class="page-header">
        <div>
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a routerLink="/dashboard">Dashboard</a>
            <span class="sep">/</span>
            <a routerLink="/banking">Banking</a>
            <span class="sep">/</span>
            <span aria-current="page">Accounts</span>
          </nav>
          <h1 class="page-title">Accounts</h1>
          <p class="page-subtitle">Overview of your accounts and balances</p>
        </div>
      </header>
    </div>

    <!-- Table occupies full width -->
    <div>
      <div class="page-card">
        <mat-card>
          <div class="table-responsive" *ngIf="vm as v">
            <table mat-table [dataSource]="v.items" class="mat-elevation-z0 accounts-table" aria-label="Accounts table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Account</th>
            <td mat-cell *matCellDef="let a">{{ a.name }} <small class="muted">({{ a.maskedNumber }})</small></td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let a">{{ a.type }}</td>
          </ng-container>
          <ng-container matColumnDef="balance">
            <th mat-header-cell *matHeaderCellDef>Balance</th>
            <td mat-cell *matCellDef="let a">{{ a.balance | number:'1.2-2' }} {{ a.currency }}</td>
          </ng-container>
          <ng-container matColumnDef="available">
            <th mat-header-cell *matHeaderCellDef>Available</th>
            <td mat-cell *matCellDef="let a">{{ a.available | number:'1.2-2' }} {{ a.currency }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
            <mat-paginator [length]="v.total" [pageSize]="v.pageSize" [pageIndex]="v.page - 1" (page)="onPage($event)"></mat-paginator>
          </div>
        </mat-card>
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host { display: block; }
    .page-header { margin-bottom: var(--space-4); }
    .breadcrumb { display: flex; gap: 8px; align-items: center; font-size: 13px; color: var(--text-secondary); }
    .breadcrumb a { color: var(--text-secondary); text-decoration: none; }
    .breadcrumb .sep { opacity: 0.5; }
    .page-title { margin: 4px 0 0 0; font-size: 20px; font-weight: 700; color: var(--text-primary); }
    .page-subtitle { margin: 4px 0 0 0; color: var(--text-secondary); font-size: 13px; }

    .accounts-table { width: 100%; border-collapse: collapse; }
    .accounts-table th, .accounts-table td { padding: 12px 16px; border-bottom: 1px solid color-mix(in srgb, var(--border-color) 60%, transparent); }
    .accounts-table thead th { font-weight: 600; color: var(--text-secondary); font-size: 13px; }
    .accounts-table tbody tr:hover { background: color-mix(in srgb, var(--primary-color) 6%, transparent); }

    .muted{ color: var(--text-secondary); font-size: 13px; }
    .table-responsive { overflow: auto; padding: var(--space-2); -webkit-overflow-scrolling: touch; }

    /* Avoid double scrollbars on narrow screens */
    @media (max-width: 720px) {
      .page-card { padding: var(--space-3); }
      .accounts-table th, .accounts-table td { padding: 10px 12px; }
    }
  `]
})
export class AccountsListComponent implements OnInit {
  displayedColumns = ['name', 'type', 'balance', 'available'];
  vm: { items: BankAccount[]; total: number; page: number; pageSize: number } | null = null;

  private destroyRef = inject(DestroyRef);
  constructor(private facade: AccountsFacade) { }

  ngOnInit(): void {
    this.facade.accounts$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => this.vm = v);
    this.facade.load();
  }

  onPage(e: PageEvent) {
    this.facade.load({ page: e.pageIndex + 1, pageSize: e.pageSize });
  }
}
