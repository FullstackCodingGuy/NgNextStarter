import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div class="unauth-wrapper">
      <h1>Access Denied</h1>
      <p>You don't have permission to access this resource.</p>
      <a routerLink="/dashboard" class="link">Go to Dashboard</a>
    </div>
  `,
  styles: [`
    .unauth-wrapper {
      text-align: center;
      padding: 50px;
      font-family: var(--font-family);
      color: var(--text-primary);
    }

    .link {
      color: var(--primary-color);
      text-decoration: none;
    }

    .link:hover, .link:focus {
      text-decoration: underline;
    }
  `]
})
export class UnauthorizedComponent { }