import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="auth-layout">
      <div class="auth-container">
        <div class="auth-header">
          <h1>Securities Position Keeping System</h1>
          <p>Secure and Professional Portfolio Management</p>
        </div>
        
        <div class="auth-form-container">
          <router-outlet></router-outlet>
        </div>
        
        <div class="auth-footer">
          <p>&copy; 2024 Securities Management Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .auth-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      max-width: 400px;
      width: 100%;
    }

    .auth-header {
      background: #3f51b5;
      color: white;
      padding: 32px 24px;
      text-align: center;
    }

    .auth-header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 500;
    }

    .auth-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .auth-form-container {
      padding: 32px 24px;
    }

    .auth-footer {
      background: #f5f5f5;
      padding: 16px 24px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }

    .auth-footer p {
      margin: 0;
    }
  `]
})
export class AuthLayoutComponent { }