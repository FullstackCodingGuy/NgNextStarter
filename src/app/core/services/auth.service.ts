import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, throwError } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest, UserRole } from '../models/user.model';
import { ApiResponse } from '../models/common.model';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  private readonly CRYPTO_SECRET = 'securities-app-secret'; // In production, use environment variable

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    if (token && this.isTokenExpired(token)) {
      this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Input validation and sanitization
    const sanitizedCredentials = this.sanitizeLoginInput(credentials);
    
    // Mock implementation - replace with actual API call
    return this.mockLogin(sanitizedCredentials).pipe(
      map(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data);
          this.currentUserSubject.next(response.data.user);
        }
        return response.data!;
      }),
      catchError(error => this.handleAuthError(error))
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    // Input validation and sanitization
    const sanitizedData = this.sanitizeRegisterInput(userData);
    
    // Mock implementation - replace with actual API call
    return this.mockRegister(sanitizedData).pipe(
      map(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data);
          this.currentUserSubject.next(response.data.user);
        }
        return response.data!;
      }),
      catchError(error => this.handleAuthError(error))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        const decrypted = CryptoJS.AES.decrypt(userData, this.CRYPTO_SECRET).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
      } catch {
        return null;
      }
    }
    return null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setAuthData(authData: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authData.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken);
    
    // Encrypt user data before storing
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(authData.user), this.CRYPTO_SECRET).toString();
    localStorage.setItem(this.USER_KEY, encrypted);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private sanitizeLoginInput(credentials: LoginRequest): LoginRequest {
    return {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password
    };
  }

  private sanitizeRegisterInput(userData: RegisterRequest): RegisterRequest {
    return {
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim()
    };
  }

  private handleAuthError(error: any): Observable<never> {
    let errorMessage = 'Authentication failed';
    if (error.error?.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }

  // Mock implementations - replace with actual API calls
  private mockLogin(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    // Simulate API delay
    return new Observable(observer => {
      setTimeout(() => {
        if (credentials.email === 'admin@securities.com' && credentials.password === 'Admin123!') {
          const mockUser: User = {
            id: '1',
            email: credentials.email,
            firstName: 'Admin',
            lastName: 'User',
            role: UserRole.ADMIN,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const mockResponse: ApiResponse<AuthResponse> = {
            success: true,
            data: {
              user: mockUser,
              token: this.generateMockToken(mockUser),
              refreshToken: 'mock-refresh-token',
              expiresIn: 3600
            },
            timestamp: new Date()
          };
          
          observer.next(mockResponse);
        } else {
          observer.error({ error: { message: 'Invalid credentials' } });
        }
        observer.complete();
      }, 1000);
    });
  }

  private mockRegister(userData: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return new Observable(observer => {
      setTimeout(() => {
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: UserRole.ANALYST,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const mockResponse: ApiResponse<AuthResponse> = {
          success: true,
          data: {
            user: mockUser,
            token: this.generateMockToken(mockUser),
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600
          },
          timestamp: new Date()
        };
        
        observer.next(mockResponse);
        observer.complete();
      }, 1000);
    });
  }

  private generateMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }
}