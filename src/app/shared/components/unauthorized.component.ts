import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="page-container">
      <div class="page-card unauth-wrapper">
        <h1>Access Denied</h1>
        <p>You don't have permission to access this resource.</p>
        <a routerLink="/dashboard" class="link">Go to Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .unauth-wrapper {
      text-align: center;
      padding: var(--space-10);
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnauthorizedComponent { }