import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { ErrorMessageComponent } from '../../../shared/components/ui-components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ErrorMessageComponent
  ],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Sign In</mat-card-title>
          <mat-card-subtitle>Access your account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input 
                matInput 
                type="email" 
                formControlName="email"
                autocomplete="email"
                [class.error]="isFieldInvalid('email')">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="isFieldInvalid('email')">
                <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</span>
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'" 
                formControlName="password"
                autocomplete="current-password"
                [class.error]="isFieldInvalid('password')">
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="isFieldInvalid('password')">
                <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
                <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
              </mat-error>
            </mat-form-field>

            <app-error-message 
              [error]="errorMessage" 
              (clear)="clearError()">
            </app-error-message>

            <div class="form-actions">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="loginForm.invalid || isLoading"
                class="full-width">
                <span *ngIf="!isLoading">Sign In</span>
                <span *ngIf="isLoading">
                  <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
                  Signing In...
                </span>
              </button>
            </div>

            <div class="form-footer">
              <p>Don't have an account? <a routerLink="/auth/register">Sign up here</a></p>
              <p><a routerLink="/auth/forgot-password">Forgot your password?</a></p>
            </div>
          </form>

          <!-- Demo Credentials -->
          <mat-card class="demo-card">
            <mat-card-content>
              <h4>Demo Credentials</h4>
              <p><strong>Email:</strong> admin@securities.com</p>
              <p><strong>Password:</strong> Admin123!</p>
            </mat-card-content>
          </mat-card>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
  font-family: var(--font-family);
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      margin: 24px 0 16px 0;
    }

    .form-footer {
      text-align: center;
      margin-top: 16px;
    }

    .form-footer p {
      margin: 8px 0;
      font-size: 14px;
    }

    .form-footer a {
      color: var(--primary-color);
      text-decoration: none;
    }

    .form-footer a:hover {
      text-decoration: underline;
    }

    .inline-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    .error {
      border-color: var(--error-color) !important;
    }

    .demo-card {
      margin-top: 24px;
      background-color: var(--surface-color);
      border: 1px solid var(--border-color);
    }

    .demo-card h4 {
      margin: 0 0 12px 0;
      color: var(--text-primary);
    }

    .demo-card p {
      margin: 4px 0;
      font-size: 14px;
      color: var(--text-secondary);
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  returnUrl = '';

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

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}