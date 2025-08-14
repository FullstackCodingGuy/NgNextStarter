import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
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

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { 'passwordMismatch': true };
  }
  
  return null;
}

@Component({
  selector: 'app-register',
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
    ErrorMessageComponent,
    AuthFormShellComponent
  ],
  template: `
    <app-auth-form-shell title="Create your account" subtitle="Join us and get started in minutes">
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
        <div class="grid">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>First name</mat-label>
            <input
              matInput
              formControlName="firstName"
              autocomplete="given-name"
              [class.error]="isFieldInvalid('firstName')"
              placeholder="Jane">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="isFieldInvalid('firstName')">First name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Last name</mat-label>
            <input
              matInput
              formControlName="lastName"
              autocomplete="family-name"
              [class.error]="isFieldInvalid('lastName')"
              placeholder="Doe">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="isFieldInvalid('lastName')">Last name is required</mat-error>
          </mat-form-field>
        </div>

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
            <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="registerForm.get('email')?.errors?.['email']">Enter a valid email</span>
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Password</mat-label>
          <input
            matInput
            [type]="hidePassword ? 'password' : 'text'"
            formControlName="password"
            autocomplete="new-password"
            [class.error]="isFieldInvalid('password')"
            placeholder="At least 8 characters">
          <mat-icon matPrefix>lock</mat-icon>
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hidePassword = !hidePassword">
            <mat-icon>{{ hidePassword ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
          <mat-error *ngIf="isFieldInvalid('password')">
            <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
            <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Minimum 8 characters</span>
            <span *ngIf="registerForm.get('password')?.errors?.['pattern']">Include upper, lower, number, and symbol</span>
          </mat-error>
        </mat-form-field>

        <div class="strength">
          <div class="bar" [class.level-1]="strengthLevel >= 1" [class.level-2]="strengthLevel >= 2" [class.level-3]="strengthLevel >= 3"></div>
          <span class="label">{{ strengthLabel }}</span>
        </div>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Confirm password</mat-label>
          <input
            matInput
            [type]="hideConfirmPassword ? 'password' : 'text'"
            formControlName="confirmPassword"
            autocomplete="new-password"
            [class.error]="isFieldInvalid('confirmPassword') || registerForm.errors?.['passwordMismatch']"
            placeholder="Re-enter password">
          <mat-icon matPrefix>lock</mat-icon>
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hideConfirmPassword = !hideConfirmPassword">
            <mat-icon>{{ hideConfirmPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
          <mat-error *ngIf="isFieldInvalid('confirmPassword')">Please confirm your password</mat-error>
          <mat-error *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched">
            Passwords do not match
          </mat-error>
        </mat-form-field>

        <app-error-message [error]="errorMessage" (clear)="clearError()"></app-error-message>

        <button
          mat-raised-button
          color="primary"
          type="submit"
          class="cta-btn full-width"
          [disabled]="registerForm.invalid || isLoading">
          <span *ngIf="!isLoading">Create account</span>
          <span *ngIf="isLoading" class="loading">
            <mat-spinner diameter="18" class="inline-spinner"></mat-spinner>
            Creating…
          </span>
        </button>

        <div links class="links">
          <span>Already have an account?</span>
          <a routerLink="/auth/login">Sign in</a>
        </div>
      </form>
    </app-auth-form-shell>
  `,
  styles: [`
    :host { display: block; font-family: var(--font-family); }
  .auth-form { display: grid; gap: var(--space-4); }
  .form-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
    .title h2 { margin: 0; font-size: clamp(18px, 1.2vw + 14px, 22px); letter-spacing: -0.01em; }
  .title p { margin: var(--space-1) 0 0 0; color: var(--text-secondary); font-size: 13px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
    @media (max-width: 480px) { .grid { grid-template-columns: 1fr; } }
    .full-width { width: 100%; }
    ::ng-deep .mat-mdc-form-field { --mdc-filled-text-field-container-color: var(--surface-color); }
  .cta-btn { margin-top: var(--space-1); }
  .links { display: flex; justify-content: center; align-items: center; gap: var(--space-2); margin-top: var(--space-2); font-size: 14px; }
    .links a { color: var(--text-secondary); text-decoration: none; }
    .links a:hover { color: var(--text-primary); text-decoration: underline; }
  .inline-spinner { display: inline-block; margin-right: var(--space-2); }
  .loading { display: inline-flex; align-items: center; gap: var(--space-2); }
    .error { border-color: var(--error-color) !important; }
  .strength { display: flex; align-items: center; gap: var(--space-2); margin: calc(var(--space-1) * -1) 0 var(--space-2); }
  .strength .bar { flex: 1; height: 6px; border-radius: 999px; background: color-mix(in srgb, var(--border-color) 60%, var(--surface-color)); position: relative; overflow: hidden; }
    .strength .bar::after { content: ""; position: absolute; left: 0; top: 0; height: 100%; width: 0%; background: var(--error-color); transition: width .25s ease, background .25s ease; }
    .strength .bar.level-1::after { width: 33%; background: var(--error-color); }
    .strength .bar.level-2::after { width: 66%; background: #f79009; }
    .strength .bar.level-3::after { width: 100%; background: var(--success-color); }
    .strength .label { min-width: 64px; text-align: right; color: var(--text-secondary); font-size: 12px; }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  errorMessage = '';

  // Password validation properties
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSpecialChar = false;
  hasMinLength = false;
  strengthLevel = 0;
  strengthLabel = 'Weak';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Strong password pattern: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(passwordPattern)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });

    // Watch password changes to update requirements and strength meter
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.updatePasswordRequirements(password);
      this.updateStrength(password || '');
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { confirmPassword, ...registerData } = this.registerForm.value;
      
      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Account created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  clearError(): void {
    this.errorMessage = '';
  }

  private updatePasswordRequirements(password: string): void {
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasLowercase = /[a-z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.hasSpecialChar = /[@$!%*?&]/.test(password);
    this.hasMinLength = password.length >= 8;
  }

  private updateStrength(password: string): void {
    let score = 0;
    if (this.hasMinLength) score++;
    if (this.hasUppercase && this.hasLowercase) score++;
    if (this.hasNumber && this.hasSpecialChar) score++;
    this.strengthLevel = score; // 0-3
    this.strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][score] || 'Weak';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}