import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
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
    imports: [CommonModule, RouterModule],
    template: `
    <nav class="sidebar" aria-label="Primary navigation">
      <div class="nav-section" *ngFor="let item of filteredItems(); trackBy: trackByLabel">
        <!-- Parent with children: render as expansion panel -->
        <ng-container *ngIf="item.children?.length; else leafLink">
          <div class="nav-group">
            <button 
              type="button"
              class="nav-group-header"
              [class.active]="isParentActive(item)"
              [class.expanded]="isParentActive(item) || isExpanded(item)"
              (click)="toggleExpansion(item)"
              (keydown)="onGroupKeydown($event, item)"
              [attr.aria-expanded]="isParentActive(item) || isExpanded(item)"
              [attr.aria-controls]="'nav-group-' + safeId(item.label)">
              <div class="nav-group-content">
                <span class="nav-icon" *ngIf="item.icon">
                  <i [class]="item.icon" aria-hidden="true"></i>
                </span>
                <span class="nav-label">{{ item.label }}</span>
              </div>
              <span class="nav-chevron">
                <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
              </span>
            </button>
            
            <div 
              class="nav-group-children"
              [class.expanded]="isParentActive(item) || isExpanded(item)"
              [id]="'nav-group-' + safeId(item.label)">
              <a 
                *ngFor="let child of item.children; trackBy: trackByLabel"
                class="nav-child-link"
                [routerLink]="child.route"
                routerLinkActive="active"
                [attr.aria-current]="(activeUrl().startsWith(child.route||'')) ? 'page' : null"
                [routerLinkActiveOptions]="{ exact: childExact(child) }"
                [attr.aria-label]="child.label">
                <span class="nav-child-indicator"></span>
                <span class="nav-child-label">{{ child.label }}</span>
              </a>
            </div>
          </div>
        </ng-container>

        <!-- Leaf without children -->
        <ng-template #leafLink>
          <a 
            class="nav-link"
            [routerLink]="item.route"
            routerLinkActive="active"
            [attr.aria-current]="(activeUrl()===item.route) ? 'page' : null"
            [routerLinkActiveOptions]="{ exact: true }"
            [attr.aria-label]="item.label"
            role="menuitem">
            <span class="nav-icon" *ngIf="item.icon">
              <i [class]="item.icon" aria-hidden="true"></i>
            </span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        </ng-template>
      </div>
    </nav>
  `,
    styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .sidebar {
      padding: var(--space-4) var(--space-3);
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-section {
      margin-bottom: var(--space-2);
    }

    /* Navigation Links */
    .nav-link {
      display: flex;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 14px;
      line-height: 1.4;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      margin-bottom: var(--space-1);
    }

    .nav-link:hover {
      background: rgba(15, 98, 254, 0.06);
      color: var(--primary-color);
      transform: translateX(2px);
    }

    .nav-link.active {
      background: var(--primary-color);
      color: white;
      box-shadow: var(--shadow-md);
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      right: var(--space-3);
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.7);
    }

    /* Navigation Groups */
    .nav-group {
      margin-bottom: var(--space-2);
    }

    .nav-group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--space-3) var(--space-4);
      border: none;
      background: transparent;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: var(--space-1);
    }

    .nav-group-header:hover {
      background: rgba(15, 98, 254, 0.06);
      color: var(--primary-color);
    }

    .nav-group-header.active {
      background: rgba(15, 98, 254, 0.1);
      color: var(--primary-color);
    }

    .nav-group-header.expanded {
      margin-bottom: var(--space-2);
    }

    .nav-group-content {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .nav-chevron {
      color: var(--text-secondary);
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-group-header.expanded .nav-chevron {
      transform: rotate(90deg);
    }

    /* Navigation Icons */
    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      font-size: 16px;
      color: inherit;
    }

    .nav-label {
      font-weight: inherit;
      color: inherit;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Child Navigation */
    .nav-group-children {
      max-height: 0;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      padding-left: var(--space-6);
    }

    .nav-group-children.expanded {
      max-height: 500px;
      padding-bottom: var(--space-2);
    }

    .nav-child-link {
      display: flex;
      align-items: center;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 400;
      font-size: 13px;
      line-height: 1.4;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: var(--space-1);
      position: relative;
    }

    .nav-child-link:hover {
      background: rgba(15, 98, 254, 0.04);
      color: var(--primary-color);
      padding-left: var(--space-4);
    }

    .nav-child-link.active {
      background: rgba(15, 98, 254, 0.1);
      color: var(--primary-color);
      font-weight: 500;
    }

    .nav-child-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-secondary);
      margin-right: var(--space-3);
      transition: all 0.2s ease;
      opacity: 0.4;
    }

    .nav-child-link:hover .nav-child-indicator,
    .nav-child-link.active .nav-child-indicator {
      background: var(--primary-color);
      opacity: 1;
      transform: scale(1.2);
    }

    .nav-child-label {
      color: inherit;
      font-weight: inherit;
    }

    /* Scrollbar Styling */
    .sidebar::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 2px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.2);
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

  // Sanitize label to safe ID (alphanumeric and dashes)
  safeId(label: string): string {
    return label.replace(/[^a-z0-9\-]+/gi, '-').toLowerCase();
  }

  onGroupKeydown(event: KeyboardEvent, item: NavItem) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleExpansion(item);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.expand(item);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.collapse(item);
    }
  }

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
    
    toggleExpansion(item: NavItem): void {
        const currentState = this.expanded()[item.label];
        this.expanded.update(s => ({ ...s, [item.label]: !currentState }));
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
