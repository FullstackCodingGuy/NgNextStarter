import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="auth-layout">
      <div class="auth-container card elevate">
        <div class="auth-header">
          <div class="brand">
            <span class="fa-solid fa-shield"></span>
            <h1>ngNextStarter</h1>
          </div>
          <p>Angular + Material starter kit with enterprise-ready patterns</p>
        </div>

        <div class="auth-form-container">
          <router-outlet></router-outlet>
        </div>

        <div class="auth-footer">
          <p>&copy; 2025 ngNextStarter Template</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      background: var(--background-color);
      display: flex;
      align-items: center;
      justify-content: center;
  padding: clamp(var(--space-4), 3vw, var(--space-8));
    }

    .auth-container {
      width: 100%;
      max-width: 420px;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .auth-header {
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      color: #fff;
      padding: var(--space-6) var(--space-5);
      text-align: center;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      justify-content: center;
      margin-bottom: var(--space-2);
    }

    .brand .fa-solid {
      font-size: 22px;
    }

    .auth-header h1 {
      margin: 0;
      font-size: clamp(18px, 1.2vw + 14px, 22px);
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .auth-header p {
      margin: var(--space-1) 0 0 0;
      opacity: 0.95;
      font-size: 13px;
      font-weight: 500;
    }

    .auth-form-container {
      padding: clamp(var(--space-4), 2.2vw, var(--space-6));
    }

    .auth-footer {
      background: var(--surface-color);
      padding: var(--space-3) var(--space-5);
      text-align: center;
      font-size: 12px;
      color: var(--text-secondary);
      border-top: 1px solid var(--border-color);
    }

    .auth-footer p {
      margin: 0;
    }

    @media (max-width: 479.98px) {
      .auth-container {
        max-width: 100%;
        border-radius: var(--radius-md);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent { }