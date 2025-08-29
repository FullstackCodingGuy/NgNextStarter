import { Component, ViewChild, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
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
      <!-- Skip link for screen readers -->
      <a class="sr-only-focusable" href="#main-content">Skip to content</a>

      <mat-toolbar color="primary" class="top-nav elegant-nav">
        <button
          mat-icon-button
          (click)="toggleSidenav()"
          class="menu-button"
          aria-label="Toggle navigation"
          [attr.aria-expanded]="sidenavOpened"
          aria-controls="main-sidenav">
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
          id="main-sidenav"
          [mode]="effectiveSidenavMode"
          [opened]="effectiveSidenavOpened"
          class="sidenav"
          role="navigation"
          aria-label="Primary">
          <app-sidebar-nav></app-sidebar-nav>
        </mat-sidenav>

        <!-- Main Content -->
        <mat-sidenav-content id="main-content" class="main-content">
          <div class="content-wrapper" [class.constrained-page]="constrainedPage">
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
  height: var(--header-h);
      display: flex;
      align-items: center;
  backdrop-filter: saturate(1.2) blur(6px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border-bottom: 1px solid var(--border-color);
  background: var(--header-bg);
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
    .menu-button, .avatar-button {
      transition: transform 120ms ease, box-shadow 120ms ease;
    }
    .sr-only-focusable {
      position: absolute;
      left: -9999px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }
    .sr-only-focusable:focus, .sr-only-focusable:active {
      position: static;
      width: auto;
      height: auto;
      margin: var(--space-2);
      padding: var(--space-2);
      background: var(--surface-color);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-sm);
      z-index: 2000;
    }
    .menu-button:focus-visible, .avatar-button:focus-visible {
      box-shadow: 0 0 0 4px var(--focus-ring-color);
      outline: none;
      border-radius: 8px;
    }
    .avatar-button:hover {
      background: rgba(255,255,255,0.18);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--user-avatar-bg);
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
    .sidenav-container > .sidenav + .main-content {
      margin-left: 0 !important;
    }

    .sidenav {
      width: 260px;
      padding: var(--space-2) 0 var(--space-4);
      border-right: 1px solid var(--border-color);
      background: var(--sidebar-bg);
      border-radius: 0;
    }

    .main-content {
      background-color: var(--background-color);
    }

    /* Page shell: make content stretch to full available width in the main area */
    .content-wrapper {
      display: flex;
      flex-direction: column;
      align-items: stretch; /* allow the page container to fill the width */
      gap: var(--space-6);
      overflow-y: auto;
      width: 100%;
      padding: 0 !important; /* remove extra gutters so child .page-container can span fully */
    }

    /* Content area now allows full-width pages; keep comfortable inner padding */
    .page-container {
      width: 100%;
      max-width: none; /* allow pages to span the main-content area */
      display: block;
      padding-inline: clamp(var(--space-4), 2vw, var(--space-6));
      box-sizing: border-box;
    }

    /* Page card fills the available width but keeps internal padding and elevation */
    .page-card {
      width: 100%;
      max-width: none;
      background: color-mix(in srgb, var(--surface-color) 94%, var(--background-color));
      border-radius: var(--radius-md);
      /* slightly reduced padding for full-bleed layouts to improve rhythm */
      padding: clamp(var(--space-3), 1vw, var(--space-4));
      box-shadow: var(--shadow-md);
      border: 1px solid color-mix(in srgb, var(--border-color) 60%, transparent);
      transition: transform 160ms ease, box-shadow 160ms ease;
    }

    /* When a page explicitly requests a constrained layout, restore comfortable padding */
    .content-wrapper.constrained-page .page-card,
    .page-container.constrained-page .page-card {
      padding: clamp(var(--space-4), 1.2vw, var(--space-5));
    }

    .page-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    /* Page header inside the page container */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .page-title {
      font-size: clamp(18px, 1.4vw, 22px);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 13px;
      margin-top: 4px;
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

  // effective values that may be overridden by per-route data
  effectiveSidenavMode: 'over' | 'side' = 'side';
  effectiveSidenavOpened = true;

  // route-driven helpers
  constrainedPage = false;
  overlaySidenavForRoute = false;

  @ViewChild('sidenav') sidenav?: MatSidenav;
  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private permissions: PermissionService
  ) {
    this.currentUser$ = this.authService.currentUser$;

    // Observe breakpoints and navigation to compute effective sidenav behavior and per-route constraints
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state: BreakpointState) => {
        const isSmall = state.matches;
        this.sidenavMode = isSmall ? 'over' : 'side';
        this.sidenavOpened = !isSmall;
        // default effective values mirror responsive defaults; navigation handler may override
        this.applyEffectiveSidenav();
      });

    // Watch navigation end to read route data flags `overlaySidenav` and `constrainedPage`
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        if (ev instanceof NavigationEnd) {
          // read deepest activated route data
          const current = this.router.routerState.root;
          let snapshot = current;
          while (snapshot.firstChild) { snapshot = snapshot.firstChild; }
          const data = snapshot.snapshot ? snapshot.snapshot.data : {};
          this.overlaySidenavForRoute = !!data?.['overlaySidenav'];
          this.constrainedPage = !!data?.['constrainedPage'];
          this.applyEffectiveSidenav();
        }
      });
  }

  private applyEffectiveSidenav() {
    // If a route requests overlaySidenav, force sidenav to 'over' and close it on desktop as well
    if (this.overlaySidenavForRoute) {
      this.effectiveSidenavMode = 'over';
      this.effectiveSidenavOpened = false;
    } else {
      this.effectiveSidenavMode = this.sidenavMode;
      this.effectiveSidenavOpened = this.sidenavOpened;
    }
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