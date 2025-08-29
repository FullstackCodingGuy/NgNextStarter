import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { BANKING_GATEWAY, BankingGateway } from '../../data/tokens';

@Component({
  selector: 'app-transaction-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSnackBarModule, MatDatepickerModule, MatNativeDateModule],
  template: `
  <div class="page-container">
    <!-- Header outside page-card -->
    <header class="page-header">
      <div>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/dashboard">Dashboard</a>
          <span class="sep">/</span>
          <a routerLink="/banking">Banking</a>
          <span class="sep">/</span>
          <span aria-current="page">New Transaction</span>
        </nav>
        <h1 class="page-title">New Transaction</h1>
        <p class="page-subtitle">Create a new transaction</p>
      </div>
    </header>

    <div class="centered">
      <div class="page-card">
        <mat-card>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="save()" novalidate>
              <div class="form-grid">
                <mat-form-field appearance="fill">
                  <mat-label>Description</mat-label>
                  <input matInput formControlName="description" autocomplete="off">
                  <mat-error *ngIf="form.controls['description'].touched && form.controls['description'].hasError('required')">Description is required</mat-error>
                  <mat-error *ngIf="form.controls['description'].hasError('minlength')">Minimum 3 characters</mat-error>
                </mat-form-field>

                <mat-form-field appearance="fill">
                  <mat-label>Amount</mat-label>
                  <input matInput type="number" step="0.01" formControlName="amount" inputmode="decimal">
                  <mat-error *ngIf="form.controls['amount'].touched && form.controls['amount'].hasError('required')">Amount is required</mat-error>
                  <mat-error *ngIf="form.controls['amount'].hasError('min')">Amount must be greater than 0</mat-error>
                </mat-form-field>

                <mat-form-field appearance="fill">
                  <mat-label>Type</mat-label>
                  <mat-select formControlName="direction">
                    <mat-option value="debit">Debit</mat-option>
                    <mat-option value="credit">Credit</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="fill">
                  <mat-label>Date</mat-label>
                  <input matInput [matDatepicker]="dt" formControlName="date">
                  <mat-datepicker-toggle matSuffix [for]="dt"></mat-datepicker-toggle>
                  <mat-datepicker #dt></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="fill">
                  <mat-label>Currency</mat-label>
                  <mat-select formControlName="currency">
                    <mat-option value="USD">USD</mat-option>
                    <mat-option value="EUR">EUR</mat-option>
                    <mat-option value="GBP">GBP</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="fill" class="full">
                  <mat-label>Notes</mat-label>
                  <textarea matInput rows="3" formControlName="notes"></textarea>
                </mat-form-field>
              </div>
            </form>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-stroked-button color="basic" routerLink="/banking/transactions">Cancel</button>
            <button mat-flat-button color="primary" [disabled]="form.invalid || saving" (click)="save()">{{ saving ? 'Saving...' : 'Create Transaction' }}</button>
          </mat-card-actions>
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

    .centered { max-width: 720px; margin: 0 auto; }
    .page-card { padding: var(--space-3); }

    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3); }
    .form-grid .full { grid-column: 1 / -1; }

    mat-card-actions { padding: var(--space-2); display: flex; gap: 8px; justify-content: flex-end; }

    @media (max-width: 720px) {
      .page-card { padding: var(--space-2); }
      .form-grid { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionNewComponent {
  form!: FormGroup;

  saving = false;

  constructor(@Inject(BANKING_GATEWAY) private gateway: BankingGateway, private snack: MatSnackBar, private fb: FormBuilder, private router: Router){
    this.form = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      direction: ['debit', Validators.required],
      date: [new Date(), Validators.required],
      currency: ['USD', Validators.required],
      notes: ['']
    });
  }

  save() {
    if (this.saving) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const payload = {
      description: this.form.value.description,
      amount: Number(this.form.value.amount),
      direction: this.form.value.direction,
      date: this.form.value.date ? new Date(this.form.value.date).toISOString() : undefined,
      currency: this.form.value.currency,
      notes: this.form.value.notes
    };

    const obs = this.gateway.createTransaction?.(payload as any);
    if (!obs) {
      this.saving = false;
      this.snack.open('Transaction service not available', 'Close', { duration: 3000 });
      return;
    }

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Transaction created', 'Close', { duration: 2000 });
        this.router.navigate(['/banking/transactions']);
      },
      error: (err) => {
        this.saving = false;
        console.error(err);
        this.snack.open('Failed to create transaction', 'Close', { duration: 3000 });
      }
    });
  }
}
