import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { TransactionsFacade } from '../../state/transactions.facade';
import { Transaction, TransactionFilter } from '../../data/models';
import { Router } from '@angular/router';
import { PermissionService } from '../../../../core/services/permission.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatPaginatorModule
  ],
  template: `
  <div class="page-container">
    <!-- Header outside of page-card -->
    <header class="page-header">
      <div>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/dashboard">Dashboard</a>
          <span class="sep">/</span>
          <a routerLink="/banking">Banking</a>
          <span class="sep">/</span>
          <span aria-current="page">Transactions</span>
        </nav>
        <h1 class="page-title">Transactions</h1>
        <p class="page-subtitle">Filter and review recent transactions</p>
      </div>
      <div class="header-actions">
        <button *ngIf="canCreate" mat-flat-button color="accent" (click)="goNew()">New Transaction</button>
      </div>
    </header>

    <!-- Filters (stacked above table) -->
    <div>
      <div class="page-card">
        <mat-card>
          <form class="filters flat" (ngSubmit)="applyFilters()" aria-label="Transaction filters">
            <mat-form-field appearance="fill" class="input">
              <mat-label>Date From</mat-label>
              <input matInput [matDatepicker]="pickerFrom" [(ngModel)]="dateFrom" name="dateFrom" aria-label="Date from">
              <mat-datepicker-toggle matSuffix [for]="pickerFrom"></mat-datepicker-toggle>
              <mat-datepicker #pickerFrom></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="fill" class="input">
              <mat-label>Date To</mat-label>
              <input matInput [matDatepicker]="pickerTo" [(ngModel)]="dateTo" name="dateTo" aria-label="Date to">
              <mat-datepicker-toggle matSuffix [for]="pickerTo"></mat-datepicker-toggle>
              <mat-datepicker #pickerTo></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="fill" class="input compact">
              <mat-label>Type</mat-label>
              <mat-select [(ngModel)]="type" name="type">
                <mat-option [value]="undefined">Any</mat-option>
                <mat-option value="debit">Debit</mat-option>
                <mat-option value="credit">Credit</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="fill" class="input compact">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="status" name="status">
                <mat-option [value]="undefined">Any</mat-option>
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="posted">Posted</mat-option>
                <mat-option value="failed">Failed</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="fill" class="input amount">
              <mat-label>Min</mat-label>
              <input matInput type="number" [(ngModel)]="minAmount" name="minAmount" step="0.01" inputmode="decimal">
            </mat-form-field>

            <mat-form-field appearance="fill" class="input amount">
              <mat-label>Max</mat-label>
              <input matInput type="number" [(ngModel)]="maxAmount" name="maxAmount" step="0.01" inputmode="decimal">
            </mat-form-field>

            <div class="actions">
              <button mat-flat-button color="primary" type="submit">Apply</button>
              <button mat-stroked-button type="button" (click)="resetFilters()">Reset</button>
            </div>
          </form>
        </mat-card>
      </div>
    </div>

    <!-- Table -->
    <div>
      <div class="page-card">
        <mat-card>
          <ng-container *ngIf="vm as v">
            <div class="table-responsive modern">
              <table mat-table [dataSource]="v.items" class="mat-elevation-z0 transactions-table" aria-label="Transactions table">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let t">{{ t.date | date:'mediumDate' }}</td>
          </ng-container>
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let t">{{ t.description }}</td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let t" [class.debit]="t.direction==='debit'" [class.credit]="t.direction==='credit'">
              {{ t.direction==='debit' ? '-' : '+'}}{{ t.amount | number:'1.2-2' }} {{ t.currency }}
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let t">{{ t.status }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <mat-paginator [length]="v.total" [pageSize]="v.pageSize" [pageIndex]="v.page - 1" (page)="onPage($event)"></mat-paginator>
            </div>
          </ng-container>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block }
    .page-header{ display:flex; justify-content:space-between; align-items:center; gap:var(--space-4); margin-bottom:var(--space-4) }
    .breadcrumb{ color:var(--text-secondary); font-size:13px; display:flex; gap:8px }
    .page-title{ margin:4px 0 0 0; font-size:20px; font-weight:700 }
    .page-subtitle{ margin:4px 0 0 0; color:var(--text-secondary); font-size:13px }
    .header-actions{ display:flex; gap:8px }

    .filters.flat{ display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:12px; align-items:end; margin-bottom: var(--space-3); }
    .filters.flat .input { background: var(--surface-color); border-radius: 8px; }
    .filters.flat .mat-form-field-appearance-filled .mat-form-field-flex { padding: 6px 10px; }
    .filters.flat .mat-form-field-appearance-filled .mat-form-field-infix { padding: 0; }
    .filters.flat .amount { max-width: 120px; }

    .actions{ display:flex; gap:var(--space-2); align-items:center }

    .table-responsive.modern{ overflow:auto; -webkit-overflow-scrolling: touch; }
    .transactions-table { width:100%; border-collapse:collapse }
    .transactions-table th, .transactions-table td { padding:12px 16px; border-bottom:1px solid color-mix(in srgb, var(--border-color) 60%, transparent) }
    .transactions-table thead th { font-weight:600; color:var(--text-secondary); font-size:13px }

    td.debit{ color: color-mix(in srgb, var(--error-color) 85%, black) }
    td.credit{ color: color-mix(in srgb, var(--success-color) 85%, black) }

    /* Responsive adjustments */
    @media (max-width:820px){ .filters.flat{ grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); } .page-header{ flex-direction:column; align-items:flex-start } }
  `]
})
export class TransactionsListComponent implements OnInit {
  displayedColumns = ['date', 'description', 'amount', 'status'];
  vm: { items: Transaction[]; total: number; page: number; pageSize: number } | null = null;

  dateFrom?: Date; dateTo?: Date; type?: 'debit' | 'credit'; status?: 'pending' | 'posted' | 'failed'; minAmount?: number; maxAmount?: number;

  private destroyRef = inject(DestroyRef);
  constructor(private facade: TransactionsFacade, private router: Router, private perms: PermissionService){}

  ngOnInit(): void {
  this.facade.transactions$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => this.vm = v);
    this.facade.load();
  }

  onPage(e: PageEvent) { this.facade.load({ page: e.pageIndex + 1, pageSize: e.pageSize }); }

  applyFilters() {
    const f: TransactionFilter = {
      dateFrom: this.dateFrom ? new Date(this.dateFrom).toISOString() : undefined,
      dateTo: this.dateTo ? new Date(this.dateTo).toISOString() : undefined,
      type: this.type,
      status: this.status,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount,
    };
    this.facade.setFilters(f);
  }

  resetFilters() {
    this.dateFrom = undefined;
    this.dateTo = undefined;
    this.type = undefined;
    this.status = undefined;
    this.minAmount = undefined;
    this.maxAmount = undefined;
    this.facade.setFilters({});
  }

  get canCreate() { return this.perms.hasAll(['banking.read','banking.write']); }
  goNew() { this.router.navigate(['/banking/transactions/new']); }
}
