import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add security headers
    let secureReq = req.clone({
      setHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    });

    // Add authentication token if available
    const token = this.authService.getToken();
    if (token) {
      secureReq = secureReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(secureReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - redirect to login
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else if (error.status === 403) {
          // Forbidden - redirect to unauthorized page
          this.router.navigate(['/unauthorized']);
        }
        
        return throwError(() => error);
      })
    );
  }
}

@Injectable()
export class SecurityInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Sanitize request data to prevent XSS
    const sanitizedReq = this.sanitizeRequest(req);
    
    return next.handle(sanitizedReq);
  }

  private sanitizeRequest(req: HttpRequest<any>): HttpRequest<any> {
    if (req.body && typeof req.body === 'object') {
      const sanitizedBody = this.sanitizeObject(req.body);
      return req.clone({ body: sanitizedBody });
    }
    return req;
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  private sanitizeString(value: any): any {
    if (typeof value === 'string') {
      // Basic XSS prevention - remove common script tags and event handlers
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '');
    }
    return value;
  }
}

// Functional interceptor variant used by app bootstrap
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        router.navigate(['/unauthorized']);
      }
      return throwError(() => error);
    })
  );
};