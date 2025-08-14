import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Inject } from '@angular/core';
import { BANKING_GATEWAY, BankingGateway } from '../../data/tokens';

@Component({
  selector: 'app-transaction-new',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <mat-card>
      <mat-card-title>New Transaction</mat-card-title>
      <form (ngSubmit)="save()" #f="ngForm">
        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <input matInput name="description" [(ngModel)]="description" required>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Amount</mat-label>
          <input matInput type="number" step="0.01" name="amount" [(ngModel)]="amount" required>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="direction" name="direction" required>
            <mat-option value="debit">Debit</mat-option>
            <mat-option value="credit">Credit</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-flat-button color="primary" type="submit" [disabled]="f.invalid">Create</button>
      </form>
    </mat-card>
  `
})
export class TransactionNewComponent {
  description = '';
  amount: number | null = null;
  direction: 'debit' | 'credit' = 'debit';

  constructor(@Inject(BANKING_GATEWAY) private gateway: BankingGateway){}

  save() {
    this.gateway.createTransaction?.({ description: this.description, amount: this.amount || 0, direction: this.direction, currency: 'USD' }).subscribe();
  }
}
