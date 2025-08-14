import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(
    private permissions: PermissionService,
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
    }

    const requiredAll = (route.data?.['permissionsAll'] as string[]) || [];
    const requiredAny = (route.data?.['permissionsAny'] as string[]) || [];

    const hasAll = requiredAll.length ? this.permissions.hasAll(requiredAll) : true;
    const hasAny = requiredAny.length ? this.permissions.hasAny(requiredAny) : true;

    if (!hasAll || !hasAny) {
      return this.router.createUrlTree(['/unauthorized']);
    }
    return true;
  }
}
