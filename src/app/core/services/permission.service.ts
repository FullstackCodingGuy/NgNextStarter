import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

/**
 * Centralized permission service.
 * Keeps app loosely coupled by mapping roles -> permissions.
 * Can be swapped with API-driven permission store later (MFE friendly).
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  // Permission keys follow a simple namespace convention: domain.action
  // These can be externalized to config later.
  private readonly ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
    [UserRole.ADMIN]: [
      'banking.read',
      'banking.write'
    ],
    [UserRole.MANAGER]: [
      'banking.read',
      'banking.write'
    ],
    [UserRole.ANALYST]: [
      'banking.read'
    ],
    [UserRole.VIEWER]: [
      'banking.read'
    ],
  } as const;

  constructor(private auth: AuthService) {}

  getPermissions(): readonly string[] {
    const user = this.auth.getCurrentUser();
    if (!user) return [];
    return this.ROLE_PERMISSIONS[user.role] ?? [];
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
}
