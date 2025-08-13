import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ErrorMessageComponent
  ],
  template: `
    <div class="register-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
          <mat-card-subtitle>Join our application</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="name-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <input 
                  matInput 
                  formControlName="firstName"
                  autocomplete="given-name"
                  [class.error]="isFieldInvalid('firstName')">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="isFieldInvalid('firstName')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <input 
                  matInput 
                  formControlName="lastName"
                  autocomplete="family-name"
                  [class.error]="isFieldInvalid('lastName')">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="isFieldInvalid('lastName')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

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
                <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'" 
                formControlName="password"
                autocomplete="new-password"
                [class.error]="isFieldInvalid('password')">
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="isFieldInvalid('password')">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</span>
                <span *ngIf="registerForm.get('password')?.errors?.['pattern']">Password must contain uppercase, lowercase, number, and special character</span>
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input 
                matInput 
                [type]="hideConfirmPassword ? 'password' : 'text'" 
                formControlName="confirmPassword"
                autocomplete="new-password"
                [class.error]="isFieldInvalid('confirmPassword') || registerForm.errors?.['passwordMismatch']">
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hideConfirmPassword = !hideConfirmPassword">
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="isFieldInvalid('confirmPassword')">
                <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
              </mat-error>
              <mat-error *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <!-- Password Requirements -->
            <div class="password-requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li [class.met]="hasUppercase">At least one uppercase letter</li>
                <li [class.met]="hasLowercase">At least one lowercase letter</li>
                <li [class.met]="hasNumber">At least one number</li>
                <li [class.met]="hasSpecialChar">At least one special character</li>
                <li [class.met]="hasMinLength">At least 8 characters long</li>
              </ul>
            </div>

            <app-error-message 
              [error]="errorMessage" 
              (clear)="clearError()">
            </app-error-message>

            <div class="form-actions">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="registerForm.invalid || isLoading"
                class="full-width">
                <span *ngIf="!isLoading">Create Account</span>
                <span *ngIf="isLoading">
                  <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
                  Creating Account...
                </span>
              </button>
            </div>

            <div class="form-footer">
              <p>Already have an account? <a routerLink="/auth/login">Sign in here</a></p>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
  font-family: var(--font-family);
    }

    .name-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .password-requirements {
      margin: 16px 0;
      padding: 16px;
      background-color: var(--surface-color);
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }

    .password-requirements h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 500;
    }

    .password-requirements ul {
      margin: 0;
      padding-left: 20px;
      font-size: 12px;
    }

    .password-requirements li {
      margin: 4px 0;
      color: var(--text-secondary);
    }

    .password-requirements li.met {
      color: var(--success-color);
      font-weight: 500;
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

    // Watch password changes to update requirements
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.updatePasswordRequirements(password);
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

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}