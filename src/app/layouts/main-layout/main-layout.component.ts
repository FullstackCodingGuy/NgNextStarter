import { Component, ViewChild, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { User, UserRole } from '../../core/models/user.model';
import { SidebarNavComponent } from './sidebar-nav.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatMenuModule,
  MatDividerModule,
  SidebarNavComponent
  ],
  template: `
    <div class="layout-container">
      <!-- Top Navigation Bar -->
      <mat-toolbar color="primary" class="top-nav elegant-nav">
        <button
          mat-icon-button
          (click)="toggleSidenav()"
          class="menu-button"
          aria-label="Open navigation">
          <span class="fa-solid fa-bars" aria-hidden="true"></span>
        </button>

        <span class="brand">
          <span class="fa-solid fa-shield" aria-hidden="true"></span>
          <span class="app-title">ngNextStarter</span>
        </span>

        <span class="spacer"></span>

        <!-- User Menu -->
        <div class="user-menu">
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-button avatar-button" aria-label="User menu">
            <span class="user-avatar" *ngIf="currentUser$ | async as user">
              {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
            </span>
            <span class="user-name" *ngIf="currentUser$ | async as user">
              {{ user.firstName }} {{ user.lastName }}
            </span>
            <span class="fa-solid fa-chevron-down" aria-hidden="true"></span>
          </button>

          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="viewProfile()">
              <span class="fa-solid fa-user" aria-hidden="true"></span>
              <span>Profile</span>
            </button>
            <button mat-menu-item (click)="viewSettings()">
              <span class="fa-solid fa-gear" aria-hidden="true"></span>
              <span>Settings</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <span class="fa-solid fa-right-from-bracket" aria-hidden="true"></span>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <!-- Side Navigation -->
      <mat-sidenav-container class="sidenav-container">
  <mat-sidenav
          #sidenav
          [mode]="sidenavMode"
          [opened]="sidenavOpened"
          class="sidenav"
          role="navigation"
          aria-label="Primary">
          <app-sidebar-nav></app-sidebar-nav>
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
    :host { --header-h: 64px; }
    @media (max-width: 599.98px) { :host { --header-h: 56px; } }

    .layout-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--background-color);
  font-family: var(--font-family);
    }

    .top-nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
      display: flex;
      align-items: center;
      backdrop-filter: saturate(1.2) blur(6px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      border-bottom: 1px solid var(--border-color);
      background: linear-gradient(90deg, var(--primary-color) 80%, var(--accent-color) 100%);
  overflow-x: hidden;
    }

    .elegant-nav .brand {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.08);
    }

    .avatar-button {
      padding: 0 var(--space-3);
      border-radius: 24px;
      background: rgba(255,255,255,0.08);
      transition: background 0.2s;
    }
    .avatar-button:hover {
      background: rgba(255,255,255,0.18);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-color) 60%, var(--primary-color) 100%);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
  margin-right: var(--space-3);
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      border: 2px solid rgba(255,255,255,0.18);
    }

    .user-name {
      font-size: 16px;
      font-weight: 500;
      color: #fff;
      margin-right: var(--space-2);
      text-shadow: 0 1px 2px rgba(0,0,0,0.08);
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
    }

    .menu-button {
      margin-right: var(--space-3);
    }

    .app-title {
      font-size: clamp(18px, 1.2vw + 12px, 20px);
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-menu {
      display: flex;
      align-items: center;
    }

    .user-button {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 500;
    }

    .sidenav-container {
      flex: 1;
      margin-top: var(--header-h);
      background: var(--background-color);
      overflow-x: hidden; /* Prevent horizontal scrollbar */
    }

    .sidenav {
      width: 260px;
      padding: var(--space-2) 0 var(--space-4);
      border-right: 1px solid var(--border-color);
      background: var(--surface-color);
    }

    .main-content {
      background-color: var(--background-color);
    }

    .content-wrapper {
      padding: clamp(var(--space-4), 1.5vw, var(--space-6));
      min-height: calc(100vh - 64px);
    }

  .active { background: color-mix(in srgb, var(--primary-color) 18%, transparent) !important; }

    .mat-mdc-list-item {
      margin-bottom: 4px;
      border-radius: var(--radius-sm);
    }

  .mat-mdc-list-item:hover { background: color-mix(in srgb, var(--primary-color) 8%, transparent); }

    h3[matSubheader] {
      color: var(--text-secondary);
      font-weight: 600;
      margin: 8px 16px 4px;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.08em;
    }

    /* Size Font Awesome icons in list to align with Material */
    [matListItemIcon].fa-solid,
    [matListItemIcon].fa-regular,
    [matListItemIcon] .fa-solid,
    [matListItemIcon] .fa-regular {
      font-size: 18px;
      width: 24px;
      text-align: center;
      color: var(--text-secondary);
    }

    @media (max-width: 959.98px) {
      .sidenav {
        width: 78vw;
        max-width: 320px;
      }
    }
  `]
  ,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  currentUser$: Observable<User | null>;

  sidenavMode: 'over' | 'side' = 'side';
  sidenavOpened = true;

  @ViewChild('sidenav') sidenav?: MatSidenav;
  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private permissions: PermissionService
  ) {
    this.currentUser$ = this.authService.currentUser$;

    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state: BreakpointState) => {
        const isSmall = state.matches;
        this.sidenavMode = isSmall ? 'over' : 'side';
        this.sidenavOpened = !isSmall;
      });
  }

  toggleSidenav(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  hasUserManagementAccess(): boolean {
    return this.authService.hasAnyRole([UserRole.ADMIN, UserRole.MANAGER]);
  }

  viewProfile(): void {
  this.router.navigate(['/settings']);
  }

  viewSettings(): void {
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  canViewBanking(): boolean {
    return this.permissions.hasPermission('banking.read');
  }
}