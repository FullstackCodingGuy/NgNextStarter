import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="dashboard-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>User Management Dashboard</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>This is a generic dashboard for the User Management module.</p>
          <ul>
            <li>View users</li>
            <li>Add new users</li>
            <li>Manage user roles and permissions</li>
            <li>Monitor user activity</li>
          </ul>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      font-family: var(--font-family);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
    }
    mat-card {
      width: 100%;
      max-width: 500px;
    }
    mat-card-title {
      font-size: 24px;
      font-weight: 500;
    }
    mat-card-content ul {
      margin: 16px 0 0 0;
      padding-left: 20px;
    }
    mat-card-content li {
      font-size: 16px;
      margin-bottom: 8px;
    }
  `]
})
export class DashboardComponent {}