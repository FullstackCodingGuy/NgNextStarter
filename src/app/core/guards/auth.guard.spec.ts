import { AuthGuard, NoAuthGuard, RoleGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserRole } from '../models/user.model';

class MockRouter {
  public navigatedTo: any[] | null = null;
  navigate(commands: any[], extras?: any) { this.navigatedTo = commands; return Promise.resolve(true); }
  createUrlTree(commands: any[], extras?: any) { return commands; }
}

function mockAuthService(overrides: Partial<AuthService> = {}): AuthService {
  return {
    isAuthenticated: () => false,
    hasAnyRole: () => false,
    ...overrides
  } as unknown as AuthService;
}

describe('Auth-related guards', () => {
  it('AuthGuard denies unauthenticated and redirects to login', async () => {
    const router = new MockRouter() as unknown as Router;
    const guard = new AuthGuard(mockAuthService(), router);
    const can = await Promise.resolve(guard.canActivate({ data: {} } as any, { url: '/secure' } as any) as any);
    expect(can).toBeFalse();
  });

  it('AuthGuard allows authenticated with required role', async () => {
    const router = new MockRouter() as unknown as Router;
    const guard = new AuthGuard(
      mockAuthService({ isAuthenticated: () => true, hasAnyRole: () => true }),
      router
    );
    const can = await Promise.resolve(guard.canActivate({ data: { roles: [UserRole.ADMIN] } } as any, { url: '/secure' } as any) as any);
    expect(can).toBeTrue();
  });

  it('NoAuthGuard blocks when already authenticated', () => {
    const router = new MockRouter() as unknown as Router;
    const guard = new NoAuthGuard(mockAuthService({ isAuthenticated: () => true }), router);
    const can = guard.canActivate();
    expect(can).toBeFalse();
  });

  it('RoleGuard denies when missing role', () => {
    const router = new MockRouter() as unknown as Router;
    const guard = new RoleGuard(
      mockAuthService({ isAuthenticated: () => true, hasAnyRole: () => false }),
      router
    );
    const can = guard.canActivate({ data: { roles: [UserRole.MANAGER] } } as any);
    expect(can).toBeFalse();
  });
});
