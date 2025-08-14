import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-card">
        <div class="page-header">
          <div>
            <h2 class="page-title">User Management</h2>
            <div class="page-subtitle">Overview of users, roles and activity</div>
          </div>
          <div class="row">
            <button mat-stroked-button>
              <mat-icon>filter_list</mat-icon>
              Filter
            </button>
            <button mat-flat-button color="primary">
              <mat-icon>person_add</mat-icon>
              New User
            </button>
          </div>
        </div>

        <section>
          <p class="mb-3">This dashboard provides quick access to user management features.</p>
          <ul>
            <li>View users</li>
            <li>Add new users</li>
            <li>Manage user roles and permissions</li>
            <li>Monitor user activity</li>
          </ul>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-card { font-family: var(--font-family); }

    .page-subtitle { margin-bottom: var(--space-3); }

    .mb-3 { margin-bottom: var(--space-3); }

    ul { margin: 0; padding-left: var(--space-5); color: var(--text-primary); }
    li { margin-bottom: var(--space-2); font-size: 15px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {}