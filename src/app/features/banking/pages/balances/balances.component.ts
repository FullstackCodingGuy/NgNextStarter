import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { BalancesFacade } from '../../state/balances.facade';
import { BalanceSummary } from '../../data/models';

@Component({
  selector: 'app-balances',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule],
  template: `
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
  `
})
export class BalancesComponent implements OnInit {
  balances: BalanceSummary[] = [];
  constructor(private facade: BalancesFacade){}
  ngOnInit(): void {
    this.facade.balances$.subscribe(v => this.balances = v);
    this.facade.load();
  }
}
