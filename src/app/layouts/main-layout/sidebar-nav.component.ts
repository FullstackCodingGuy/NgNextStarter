import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { filter, map, startWith, Subject, takeUntil } from 'rxjs';
import { PermissionService } from '../../core/services/permission.service';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

type NavPermission = {
    any?: readonly string[];
    all?: readonly string[];
    roles?: readonly UserRole[];
};

export type NavItem = {
    label: string;
    icon?: string; // Font Awesome class, e.g., 'fa-solid fa-gauge'
    route?: string; // Absolute route
    children?: NavItem[];
    permissions?: NavPermission;
};

@Component({
    selector: 'app-sidebar-nav',
    standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatExpansionModule],
    template: `
    <nav class="sidebar" aria-label="Primary">
      <div class="section" *ngFor="let item of filteredItems() ; trackBy: trackByLabel">
        <!-- Parent with children: render as expansion panel -->
        <ng-container *ngIf="item.children?.length; else leafLink">
          <mat-expansion-panel class="nav-expansion"
                               [expanded]="isParentActive(item) || isExpanded(item)"
                               (opened)="expand(item)"
                               (closed)="collapse(item)"
                               [hideToggle]="true"
                               displayMode="flat">
            <mat-expansion-panel-header>
              <div class="nav-item">
                <span class="icon ui-icon" *ngIf="item.icon"><span [class]="item.icon" aria-hidden="true"></span></span>
                <span class="label">{{ item.label }}</span>
              </div>
              <span class="chevron fa-solid fa-chevron-down" aria-hidden="true"></span>
            </mat-expansion-panel-header>
            <mat-nav-list class="child-list">
          <a mat-list-item
                 class="child-link"
                 *ngFor="let child of item.children; trackBy: trackByLabel"
                 [routerLink]="child.route"
                 routerLinkActive="active"
            [attr.aria-current]="(activeUrl().startsWith(child.route||'')) ? 'page' : null"
                 [routerLinkActiveOptions]="{ exact: childExact(child) }"
                 [attr.aria-label]="child.label">
                <span class="icon ui-icon" *ngIf="child.icon"><span [class]="child.icon" aria-hidden="true"></span></span>
                <span class="label">{{ child.label }}</span>
              </a>
            </mat-nav-list>
          </mat-expansion-panel>
        </ng-container>

        <!-- Leaf without children -->
        <ng-template #leafLink>
       <a mat-list-item class="root-link"
             [routerLink]="item.route"
             routerLinkActive="active"
         [attr.aria-current]="(activeUrl()===item.route) ? 'page' : null"
             [routerLinkActiveOptions]="{ exact: true }"
             [attr.aria-label]="item.label">
            <span class="icon ui-icon" *ngIf="item.icon"><span [class]="item.icon" aria-hidden="true"></span></span>
            <span class="label">{{ item.label }}</span>
          </a>
        </ng-template>
      </div>
    </nav>
  `,
    styles: [`
    :host { display: block; }
    .sidebar {
    padding: var(--space-2) var(--space-2) var(--space-4);
    overflow-x: hidden; /* Avoid bottom scrollbar from nested items */
    }
    .section { margin-bottom: var(--space-1); }

  .nav-item, .root-link, .child-link {
      display: inline-flex;
      align-items: center;
  gap: var(--space-3);
      font-weight: 500;
    }

    .root-link, .child-link {
  border-radius: var(--radius-sm);
  margin: var(--space-1) var(--space-2);
    }
    .root-link:hover, .child-link:hover {
      background: color-mix(in srgb, var(--primary-color) 8%, transparent);
    }
    .active {
      background: color-mix(in srgb, var(--primary-color) 16%, transparent) !important;
    }

    .nav-expansion {
      border-radius: var(--radius-sm) !important;
      box-shadow: none !important;
      background: transparent !important;
    }
    .nav-expansion ::ng-deep .mat-expansion-panel-header {
      border-radius: var(--radius-sm);
      padding: 0 var(--space-3);
      height: 44px;
      width: 100%;
    }
    .nav-expansion ::ng-deep .mat-expansion-panel-header:hover {
      background: color-mix(in srgb, var(--primary-color) 8%, transparent);
    }
    .nav-expansion .mat-expansion-panel-header .chevron {
      margin-left: auto;
      transition: transform 0.2s ease;
      color: var(--text-secondary);
    }
    .nav-expansion.mat-expanded .mat-expansion-panel-header .chevron {
      transform: rotate(180deg);
    }
  .child-list { padding-left: var(--space-2); overflow-x: hidden; }
  .child-link { gap: var(--space-3); }
  .child-link .icon { color: var(--text-secondary); }

  /* Icon sizing handled by .ui-icon utility */
    .label {
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarNavComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    private permissions = inject(PermissionService);
    private auth = inject(AuthService);

    // Optional external items input; if not provided, use defaultItems
    @Input() items: NavItem[] | null = null;

    private destroy$ = new Subject<void>();
    activeUrl = signal<string>('');
    expanded = signal<Record<string, boolean>>({});

    readonly defaultItems: NavItem[] = [
        { label: 'Dashboard', icon: 'fa-solid fa-gauge', route: '/dashboard' },
        { label: 'Global State Demo', icon: 'fa-solid fa-flask', route: '/global-state-demo' },
        {
            label: 'Banking', icon: 'fa-solid fa-building-columns',
            permissions: { any: ['banking.read'] },
            children: [
                { label: 'Accounts', icon: 'fa-solid fa-wallet', route: '/banking/accounts' },
                { label: 'Balances', icon: 'fa-solid fa-scale-balanced', route: '/banking/balances' },
                { label: 'Transactions', icon: 'fa-solid fa-right-left', route: '/banking/transactions' },
            ]
        },
        {
            label: 'Users', icon: 'fa-solid fa-users',
            permissions: { roles: [UserRole.ADMIN, UserRole.MANAGER] },
            children: [
                { label: 'List', icon: 'fa-regular fa-rectangle-list', route: '/users/list' },
            ]
        },
        {
            label: 'Securities', icon: 'fa-solid fa-shield-halved',
            children: [
                { label: 'List', icon: 'fa-regular fa-rectangle-list', route: '/securities/list' },
            ]
        },
    ];

    filteredItems = computed(() => this.filterByAccess(this.items ?? this.defaultItems));

    ngOnInit(): void {
        // Track active URL
        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            map(() => this.router.url),
            startWith(this.router.url),
            takeUntil(this.destroy$)
        ).subscribe(url => this.activeUrl.set(url));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    trackByLabel = (_: number, item: NavItem) => item.label;

    childExact(child: NavItem): boolean {
        // Exact match for routes without nested subroutes under same path segment
        return !child.children || child.children.length === 0;
    }

    isParentActive(item: NavItem): boolean {
        const url = this.activeUrl();
        const candidates: string[] = [];
        if (item.route) candidates.push(item.route);
        (item.children ?? []).forEach(c => c.route && candidates.push(c.route));
        return candidates.some(r => r && url.startsWith(r));
    }

    isExpanded(item: NavItem): boolean {
        return !!this.expanded()[item.label];
    }
    expand(item: NavItem) { this.expanded.update(s => ({ ...s, [item.label]: true })); }
    collapse(item: NavItem) { this.expanded.update(s => ({ ...s, [item.label]: false })); }

    private filterByAccess(items: NavItem[]): NavItem[] {
        return items
            .filter(i => this.hasAccess(i.permissions))
            .map(i => ({
                ...i,
                children: i.children ? this.filterByAccess(i.children) : undefined
            }))
            .filter(i => (i.children ? i.children.length > 0 : true));
    }

    private hasAccess(guard?: NavPermission): boolean {
        if (!guard) return true;
        // Role-based
        if (guard.roles && guard.roles.length) {
            const user = this.auth.getCurrentUser();
            if (!user) return false;
            if (!guard.roles.includes(user.role)) return false;
        }
        // Permission any
        if (guard.any && guard.any.length) {
            if (!this.permissions.hasAny(guard.any)) return false;
        }
        // Permission all
        if (guard.all && guard.all.length) {
            if (!this.permissions.hasAll(guard.all)) return false;
        }
        return true;
    }
}
