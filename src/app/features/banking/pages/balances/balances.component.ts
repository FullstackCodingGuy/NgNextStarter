import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { BalancesFacade } from '../../state/balances.facade';
import { BalanceSummary } from '../../data/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-balances',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule],
  template: `
  <div class="page-container">
    <div class="page-card">
      <header class="page-header">
        <div>
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a routerLink="/dashboard">Dashboard</a>
            <span class="sep">/</span>
            <a routerLink="/banking">Banking</a>
            <span class="sep">/</span>
            <span aria-current="page">Balances</span>
          </nav>
          <h1 class="page-title">Balances</h1>
          <p class="page-subtitle">Current and available balances across your accounts</p>
        </div>
      </header>
    </div>

    <div>
      <div class="page-card">
        <mat-card>
          <mat-list role="list" class="balances-list">
            <mat-list-item role="listitem" *ngFor="let b of balances">
              <div class="balance-item-left">
                <div class="account-id">{{ b.accountId }}</div>
                <div class="muted">As of {{ b.asOf | date:'short' }}</div>
              </div>
              <div class="balance-item-right">
                <div class="current">{{ b.current | number:'1.2-2' }}</div>
                <div class="available muted">Available: {{ b.available | number:'1.2-2' }}</div>
              </div>
            </mat-list-item>
          </mat-list>
        </mat-card>
      </div>
    </div>

    <div>
      <!-- Reserved for an account summary or quick actions (future) -->
      <div class="page-card">
        <mat-card>
          <h3>Summary</h3>
          <p class="muted">Quick totals and actions can live here.</p>
        </mat-card>
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host { display: block; }
    .page-header { margin-bottom: var(--space-4); }
    .breadcrumb { display:flex; gap:8px; color:var(--text-secondary); font-size:13px }
    .page-title{ margin:4px 0 0 0; font-size:20px; font-weight:700 }
    .page-subtitle{ margin:4px 0 0 0; color:var(--text-secondary); font-size:13px }

    .balances-list { display: grid; gap: var(--space-3); }
    .balances-list .mat-list-item { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-radius:8px }
    .balance-item-left .account-id { font-weight:600 }
    .balance-item-right .current { font-weight:700; font-size:16px }
    .muted { color:var(--text-secondary); font-size:13px }

    @media (max-width:720px){ .balances-list .mat-list-item{ flex-direction:column; align-items:flex-start; gap:6px } .balance-item-right{ align-self:flex-end } }
  `]
})
export class BalancesComponent implements OnInit {
  balances: BalanceSummary[] = [];
  private destroyRef = inject(DestroyRef);
  constructor(private facade: BalancesFacade){}
  ngOnInit(): void {
    this.facade.balances$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => this.balances = v);
    this.facade.load();
  }
}
