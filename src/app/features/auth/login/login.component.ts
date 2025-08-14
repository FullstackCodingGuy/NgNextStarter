import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { ErrorMessageComponent } from '../../../shared/components/ui-components';
import { AuthFormShellComponent } from '../../../shared/components/auth-form-shell.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
    ErrorMessageComponent,
    AuthFormShellComponent
  ],
  template: `
    <app-auth-form-shell title="Welcome back" subtitle="Sign in to your account to continue">
      <button *ngIf="developerMode" type="button" action class="ghost-btn" (click)="prefillDemo()" aria-label="Prefill demo credentials">
        <mat-icon>bolt</mat-icon>
        Use demo
      </button>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input
            matInput
            type="email"
            formControlName="email"
            autocomplete="email"
            [class.error]="isFieldInvalid('email')"
            placeholder="you@example.com">
          <mat-icon matPrefix>mail</mat-icon>
          <mat-error *ngIf="isFieldInvalid('email')">
            <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="loginForm.get('email')?.errors?.['email']">Enter a valid email</span>
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Password</mat-label>
          <input
            matInput
            [type]="hidePassword ? 'password' : 'text'"
            formControlName="password"
            autocomplete="current-password"
            [class.error]="isFieldInvalid('password')"
            placeholder="••••••••">
          <mat-icon matPrefix>lock</mat-icon>
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hidePassword = !hidePassword"
            [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'"
            [attr.aria-pressed]="!hidePassword">
            <mat-icon>{{ hidePassword ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
          <mat-error *ngIf="isFieldInvalid('password')">
            <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
            <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Minimum 6 characters</span>
          </mat-error>
        </mat-form-field>

        <app-error-message [error]="errorMessage" (clear)="clearError()"></app-error-message>

        <button
          mat-raised-button
          color="primary"
          type="submit"
          class="cta-btn full-width"
          [disabled]="loginForm.invalid || isLoading">
          <span *ngIf="!isLoading">Sign In</span>
          <span *ngIf="isLoading" class="loading">
            <mat-spinner diameter="18" class="inline-spinner"></mat-spinner>
            Signing in…
          </span>
        </button>

        <div links class="links">
          <a routerLink="/auth/forgot-password">Forgot password?</a>
          <span class="divider">•</span>
          <a routerLink="/auth/register">Create account</a>
        </div>

  <p *ngIf="developerMode" class="microcopy">Tip: you can use <strong>admin@securities.com</strong> / <strong>Admin123!</strong></p>
      </form>
    </app-auth-form-shell>
  `,
  styles: [`
    :host { display: block; font-family: var(--font-family); }

    .auth-form {
      display: grid;
  gap: var(--space-4);
    }

    .form-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
  gap: var(--space-3);
    }

    .title h2 {
      margin: 0;
      font-size: clamp(18px, 1.2vw + 14px, 22px);
      letter-spacing: -0.01em;
    }

    .title p {
  margin: var(--space-1) 0 0 0;
      color: var(--text-secondary);
      font-size: 13px;
    }

    .ghost-btn {
      display: inline-flex;
      align-items: center;
  gap: var(--space-2);
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-primary);
  padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease;
    }
    .ghost-btn:hover {
      background: color-mix(in srgb, var(--primary-color) 6%, transparent);
      border-color: color-mix(in srgb, var(--primary-color) 30%, var(--border-color));
    }

    .full-width { width: 100%; }

    ::ng-deep .mat-mdc-form-field {
      --mdc-filled-text-field-container-color: var(--surface-color);
    }

  .cta-btn { margin-top: var(--space-1); }

    .links {
      display: flex;
      justify-content: center;
      align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
      font-size: 14px;
    }
    .links a { color: var(--text-secondary); text-decoration: none; }
    .links a:hover { color: var(--text-primary); text-decoration: underline; }
    .links .divider { color: var(--border-color); }

  .inline-spinner { display: inline-block; margin-right: var(--space-2); }
  .loading { display: inline-flex; align-items: center; gap: var(--space-2); }

    .error { border-color: var(--error-color) !important; }

    .microcopy {
  margin: var(--space-2) 0 0 0;
      color: var(--text-secondary);
      font-size: 12px;
      text-align: center;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  returnUrl = '';
  developerMode = environment.features.developerMode;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Get return URL from query parameters
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData = this.loginForm.value;
      
      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  clearError(): void {
    this.errorMessage = '';
  }

  prefillDemo(): void {
    this.loginForm.patchValue({
      email: 'admin@securities.com',
      password: 'Admin123!'
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}