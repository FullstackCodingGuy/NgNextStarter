import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  template: `
    <div class="layout-container">
      <!-- Top Navigation Bar -->
      <mat-toolbar color="primary" class="top-nav">
        <button 
          mat-icon-button 
          (click)="toggleSidenav()"
          class="menu-button">
          <mat-icon>menu</mat-icon>
        </button>
        
        <span class="app-title">Securities Position Keeping System</span>
        
        <span class="spacer"></span>
        
        <!-- User Menu -->
        <div class="user-menu">
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
            <mat-icon>account_circle</mat-icon>
            <span *ngIf="currentUser$ | async as user">
              {{ user.firstName }} {{ user.lastName }}
            </span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="viewProfile()">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>
            <button mat-menu-item (click)="viewSettings()">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <!-- Side Navigation -->
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav 
          #sidenav 
          mode="side" 
          opened="true" 
          class="sidenav"
          fixedInViewport="true">
          
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            
            <a mat-list-item routerLink="/securities" routerLinkActive="active">
              <mat-icon matListItemIcon>account_balance</mat-icon>
              <span matListItemTitle>Securities</span>
            </a>
            
            <a mat-list-item 
               routerLink="/users" 
               routerLinkActive="active"
               *ngIf="hasUserManagementAccess()">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>User Management</span>
            </a>
            
            <mat-divider></mat-divider>
            
            <h3 matSubheader>Reports</h3>
            <a mat-list-item routerLink="/reports/portfolio" routerLinkActive="active">
              <mat-icon matListItemIcon>assessment</mat-icon>
              <span matListItemTitle>Portfolio Analysis</span>
            </a>
            
            <a mat-list-item routerLink="/reports/performance" routerLinkActive="active">
              <mat-icon matListItemIcon>trending_up</mat-icon>
              <span matListItemTitle>Performance</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <!-- Main Content -->
        <mat-sidenav-content class="main-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .top-nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
    }

    .menu-button {
      margin-right: 16px;
    }

    .app-title {
      font-size: 20px;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-menu {
      display: flex;
      align-items: center;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px;
    }

    .sidenav {
      width: 250px;
      padding: 16px 0;
    }

    .main-content {
      background-color: #fafafa;
    }

    .content-wrapper {
      padding: 24px;
      min-height: calc(100vh - 64px);
    }

    .active {
      background-color: rgba(0, 0, 0, 0.1) !important;
    }

    .mat-mdc-list-item {
      margin-bottom: 4px;
    }

    h3[matSubheader] {
      color: #666;
      font-weight: 500;
      margin-top: 16px;
    }
  `]
})
export class MainLayoutComponent {
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  toggleSidenav(): void {
    // This will be handled by the sidenav reference
  }

  hasUserManagementAccess(): boolean {
    return this.authService.hasAnyRole(['admin', 'manager'] as any);
  }

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }

  viewSettings(): void {
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}