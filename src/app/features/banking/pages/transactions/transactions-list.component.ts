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
      <div class="page-card">
        <mat-card>
          <mat-card-title>My Transactions</mat-card-title>
          <form class="filters" (ngSubmit)="applyFilters()" aria-label="Transaction filters">
        <mat-form-field appearance="outline">
          <mat-label>Date From</mat-label>
          <input matInput [matDatepicker]="pickerFrom" [(ngModel)]="dateFrom" name="dateFrom" aria-label="Date from">
          <mat-datepicker-toggle matSuffix [for]="pickerFrom"></mat-datepicker-toggle>
          <mat-datepicker #pickerFrom></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Date To</mat-label>
          <input matInput [matDatepicker]="pickerTo" [(ngModel)]="dateTo" name="dateTo" aria-label="Date to">
          <mat-datepicker-toggle matSuffix [for]="pickerTo"></mat-datepicker-toggle>
          <mat-datepicker #pickerTo></mat-datepicker>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="type" name="type">
            <mat-option [value]="undefined">Any</mat-option>
            <mat-option value="debit">Debit</mat-option>
            <mat-option value="credit">Credit</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="status" name="status">
            <mat-option [value]="undefined">Any</mat-option>
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="posted">Posted</mat-option>
            <mat-option value="failed">Failed</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Min Amount</mat-label>
          <input matInput type="number" [(ngModel)]="minAmount" name="minAmount" step="0.01">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Max Amount</mat-label>
          <input matInput type="number" [(ngModel)]="maxAmount" name="maxAmount" step="0.01">
        </mat-form-field>
        <div class="actions">
          <button mat-flat-button color="primary" type="submit">Apply</button>
          <button *ngIf="canCreate" mat-stroked-button color="accent" type="button" (click)="goNew()">New Transaction</button>
        </div>
      </form>
          
          <ng-container *ngIf="vm as v">
            <div class="table-responsive">
          <table mat-table [dataSource]="v.items" class="mat-elevation-z0" aria-label="Transactions table">
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
  .filters{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-3);margin-bottom:var(--space-3);align-items:end}
  .actions{display:flex;gap:var(--space-2)}
    .table-responsive{overflow:auto}
    td.debit{color:color-mix(in srgb, var(--error-color) 85%, black)}
    td.credit{color:color-mix(in srgb, var(--success-color) 85%, black)}
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

  get canCreate() { return this.perms.hasAll(['banking.read','banking.write']); }
  goNew() { this.router.navigate(['/banking/transactions/new']); }
}
