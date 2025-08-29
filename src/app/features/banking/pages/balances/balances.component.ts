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
        <mat-card>
          <mat-card-title>Account Balances</mat-card-title>
          <mat-list role="list">
            <mat-list-item role="listitem" *ngFor="let b of balances">
              <div matListItemTitle>{{ b.accountId }}</div>
              <div matListItemLine>
                Current: {{ b.current | number:'1.2-2' }} | Available: {{ b.available | number:'1.2-2' }} (as of {{ b.asOf | date:'short' }})
              </div>
            </mat-list-item>
          </mat-list>
        </mat-card>
      </div>
    </div>
  `
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
