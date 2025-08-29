import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthFormShellComponent } from '../../../shared/components/auth-form-shell.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, AuthFormShellComponent],
  template: `
    <div class="page-container">
      <div class="page-card">
        <app-auth-form-shell title="Reset your password" subtitle="We’ll email you a link to reset it" [compact]="true">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" placeholder="you@example.com">
          <mat-icon matPrefix>mail</mat-icon>
        </mat-form-field>

        <button mat-raised-button color="primary" class="full-width" type="submit" [disabled]="form.invalid || loading">
          <span *ngIf="!loading">Send reset link</span>
          <span *ngIf="loading">Sending…</span>
        </button>
      </form>
        </app-auth-form-shell>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: var(--font-family); }
  .auth-form { display: grid; gap: var(--space-4); }
  .form-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
    .title h2 { margin: 0; font-size: clamp(18px, 1.2vw + 14px, 22px); letter-spacing: -0.01em; }
  .title p { margin: var(--space-1) 0 0 0; color: var(--text-secondary); font-size: 13px; }
    .full-width { width: 100%; }
  `]
})
export class ForgotPasswordComponent {
  form!: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private snack: MatSnackBar) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    // Simulate a network call; integrate with API when available
    setTimeout(() => {
      this.loading = false;
      this.snack.open('If an account exists, a reset link has been sent.', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
    }, 900);
  }
}
