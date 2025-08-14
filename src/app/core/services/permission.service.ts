import { Injectable, Optional, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';
import { FEATURE_PERMISSIONS } from '../tokens/permissions.token';

/**
 * Centralized permission service.
 * Keeps app loosely coupled by mapping roles -> permissions.
 * Can be swapped with API-driven permission store later (MFE friendly).
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private auth: AuthService, @Optional() @Inject(FEATURE_PERMISSIONS) private _features?: ReadonlyArray<string>) {}

  // Permission keys follow a simple namespace convention: domain.action
  // These can be externalized to config later.
  private readonly ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
    [UserRole.ADMIN]: [
      'read', 'write', 'delete', 'admin', 'manage_users', 'manage_settings',
      'banking.read', 'banking.write'
    ],
    [UserRole.MANAGER]: [
      'read', 'write', 'delete', 'manage_team',
      'banking.read', 'banking.write'
    ],
    [UserRole.ANALYST]: [
      'read', 'write', 'analyze',
      'banking.read'
    ],
    [UserRole.VIEWER]: [
      'read',
      'banking.read'
    ],
  } as const;

  getPermissions(): readonly string[] {
    const user = this.tryGetCurrentUser();
    if (!user) return [];
    return this.ROLE_PERMISSIONS[user.role] ?? [];
  }

  getPermissionsForUser(user: { role: UserRole }): readonly string[] {
    return this.ROLE_PERMISSIONS[user.role] ?? [];
  }

  getPermissionsMutable(): string[] {
    return [...this.getPermissions()];
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  hasAll(permissions: readonly string[] = []): boolean {
    const set = new Set(this.getPermissions());
    return permissions.every(p => set.has(p));
  }

  hasAny(permissions: readonly string[] = []): boolean {
    const set = new Set(this.getPermissions());
    return permissions.some(p => set.has(p));
  }

  private tryGetCurrentUser(): { role: UserRole } | null {
    const maybeFn = (this.auth as any)?.getCurrentUser;
    if (typeof maybeFn === 'function') {
      try { return maybeFn.call(this.auth); } catch { /* noop */ }
    }
    try {
      const raw = localStorage.getItem('current_user');
      if (raw) return JSON.parse(raw);
    } catch { /* noop */ }
    return null;
  }
}
