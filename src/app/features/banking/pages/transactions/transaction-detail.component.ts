import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Inject } from '@angular/core';
import { BANKING_GATEWAY, BankingGateway } from '../../data/tokens';
import { Transaction } from '../../data/models';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card *ngIf="tx">
      <mat-card-title>Transaction Details</mat-card-title>
      <div class="grid">
        <div><strong>ID:</strong> {{tx.id}}</div>
        <div><strong>Date:</strong> {{tx.date | date:'medium'}}</div>
        <div><strong>Description:</strong> {{tx.description}}</div>
        <div><strong>Amount:</strong> {{tx.amount | number:'1.2-2'}} {{tx.currency}}</div>
        <div><strong>Direction:</strong> {{tx.direction}}</div>
        <div><strong>Status:</strong> {{tx.status}}</div>
        <div><strong>Reference:</strong> {{tx.reference}}</div>
      </div>
    </mat-card>
  `,
  styles: [`.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}`]
})
export class TransactionDetailComponent implements OnInit {
  tx?: Transaction;
  constructor(private route: ActivatedRoute, @Inject(BANKING_GATEWAY) private gateway: BankingGateway){}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.gateway.getTransaction(id).subscribe(v => this.tx = v);
  }
}
