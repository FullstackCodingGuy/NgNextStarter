import { Component } from '@angular/core';
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
      padding: clamp(16px, 3vw, 32px);
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
      padding: 28px 22px;
      text-align: center;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
      margin-bottom: 6px;
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
      margin: 4px 0 0 0;
      opacity: 0.95;
      font-size: 13px;
      font-weight: 500;
    }

    .auth-form-container {
      padding: clamp(18px, 2.2vw, 24px);
    }

    .auth-footer {
      background: var(--surface-color);
      padding: 14px 22px;
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
  `]
})
export class AuthLayoutComponent { }