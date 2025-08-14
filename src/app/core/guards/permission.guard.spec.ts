import { PermissionGuard } from './permission.guard';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

class MockRouter {
  public tree: any;
  navigate(commands: any[], extras?: any) { return Promise.resolve(true); }
  createUrlTree(commands: any[], extras?: any) { this.tree = commands; return commands; }
}

describe('PermissionGuard', () => {
  function mockAuth(isAuthenticated: boolean): AuthService {
    return { isAuthenticated: () => isAuthenticated } as unknown as AuthService;
  }
  function mockPerms(hasAll: boolean, hasAny: boolean): PermissionService {
    return {
      hasAll: () => hasAll,
      hasAny: () => hasAny
    } as unknown as PermissionService;
  }

  it('redirects to login when unauthenticated', () => {
    const router = new MockRouter() as unknown as Router;
    const guard = new PermissionGuard(mockPerms(true, true), mockAuth(false), router);
    const result = guard.canActivate({ data: {} } as any, { url: '/secure' } as any);
    expect(Array.isArray(result)).toBeTrue();
  });

  it('allows when permissions satisfied', () => {
    const router = new MockRouter() as unknown as Router;
    const guard = new PermissionGuard(mockPerms(true, true), mockAuth(true), router);
    const result = guard.canActivate({ data: { permissionsAll: ['banking.read'] } } as any, { url: '/banking' } as any);
    expect(result).toBeTrue();
  });

  it('denies when missing any required', () => {
    const router = new MockRouter() as unknown as Router;
    const guard = new PermissionGuard(mockPerms(false, true), mockAuth(true), router);
    const result = guard.canActivate({ data: { permissionsAll: ['banking.write'] } } as any, { url: '/banking' } as any);
    expect(Array.isArray(result)).toBeTrue();
  });
});
