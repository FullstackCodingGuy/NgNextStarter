import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Check for required roles
    const requiredRoles = route.data['roles'] as UserRole[];
    if (requiredRoles && requiredRoles.length > 0) {
      if (!this.authService.hasAnyRole(requiredRoles)) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as UserRole[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (!this.authService.hasAnyRole(requiredRoles)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}