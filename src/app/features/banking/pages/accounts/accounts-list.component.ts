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
      <div class="page-card">
        <mat-card>
          <mat-card-title>My Accounts</mat-card-title>
          <div class="table-responsive" *ngIf="vm as v">
        <table mat-table [dataSource]="v.items" class="mat-elevation-z0" aria-label="Accounts table">
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
  `,
  styles: [`.table-responsive { overflow: auto; } .muted{color:var(--text-secondary)} .table-responsive{padding:var(--space-2)}`]
})
export class AccountsListComponent implements OnInit {
  displayedColumns = ['name', 'type', 'balance', 'available'];
  vm: { items: BankAccount[]; total: number; page: number; pageSize: number } | null = null;

  private destroyRef = inject(DestroyRef);
  constructor(private facade: AccountsFacade){}

  ngOnInit(): void {
  this.facade.accounts$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => this.vm = v);
    this.facade.load();
  }

  onPage(e: PageEvent) {
    this.facade.load({ page: e.pageIndex + 1, pageSize: e.pageSize });
  }
}
