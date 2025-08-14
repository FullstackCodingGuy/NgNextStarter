import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-spinner" [class.overlay]="overlay">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
  padding: var(--space-5);
    }

    .loading-spinner.overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
  background: color-mix(in srgb, var(--background-color) 80%, transparent);
  z-index: 9999;
    }

    .spinner-container { text-align: center; }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--border-color);
      border-top: 4px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-message {
      margin-top: var(--space-3);
      color: var(--text-secondary);
      font-size: 14px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() overlay = false;
  @Input() message?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <mat-dialog-content>
      <p>{{ message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" cdkFocusInitial>
        {{ cancelText }}
      </button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        {{ confirmText }}
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmationDialogComponent {
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
}

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="error-message" *ngIf="error">
      <mat-icon>error</mat-icon>
      <span>{{ error }}</span>
      <button mat-icon-button (click)="clearError()" *ngIf="clearable">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .error-message {
      display: flex;
      align-items: center;
  padding: var(--space-3) var(--space-4);
  background-color: color-mix(in srgb, var(--error-color) 10%, var(--surface-color));
      color: var(--error-color);
  border-radius: var(--radius-sm);
  margin: var(--space-2) 0;
      border-left: 4px solid var(--error-color);
    }

    .error-message mat-icon:first-child {
  margin-right: var(--space-2);
    }

    .error-message span {
      flex: 1;
    }
  `]
})
export class ErrorMessageComponent {
  @Input() error?: string;
  @Input() clearable = true;
  @Output() clear = new EventEmitter<void>();

  clearError(): void {
    this.clear.emit();
  }
}