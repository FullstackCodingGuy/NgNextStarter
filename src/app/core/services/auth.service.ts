import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, throwError } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest, UserRole } from '../models/user.model';
import { ApiResponse } from '../models/common.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  private readonly SECURE_USER_KEY = 'current_user_secure';
  // Use environment-provided key material for local storage encryption
  private readonly CRYPTO_SECRET = environment.security.localEncryptionKey || 'dev-key';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  private webCryptoAvailable: boolean = (() => {
    try {
      const w = (globalThis as any).crypto;
      return !!(w && (w.subtle || w.webkitSubtle) && typeof w.getRandomValues === 'function');
    } catch {
      return false;
    }
  })();

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
    if (this.isBrowser) {
      try { localStorage.removeItem(this.TOKEN_KEY); } catch {}
      try { localStorage.removeItem(this.REFRESH_TOKEN_KEY); } catch {}
      try { localStorage.removeItem(this.USER_KEY); } catch {}
      try { localStorage.removeItem(this.SECURE_USER_KEY); } catch {}
    }
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
  if (!this.isBrowser) return null;
  const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
  return JSON.parse(userData) as User;
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
  if (!this.isBrowser) return null;
  return localStorage.getItem(this.TOKEN_KEY);
  }

  private setAuthData(authData: AuthResponse): void {
    if (this.isBrowser) {
      try { localStorage.setItem(this.TOKEN_KEY, authData.token); } catch {}
      try { localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken); } catch {}

      // Store plaintext for synchronous access
      try { localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user)); } catch {}

      // Additionally store an encrypted mirror (non-blocking) only when Web Crypto is available
      if (this.webCryptoAvailable) {
        this.encryptUser(JSON.stringify(authData.user))
          .then(payload => { try { localStorage.setItem(this.SECURE_USER_KEY, JSON.stringify(payload)); } catch {} })
          .catch(() => void 0);
      }
    }
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

  // --- Web Crypto helpers for local encryption (AES-GCM) ---
  private async getKey(): Promise<CryptoKey> {
    if (!this.webCryptoAvailable) throw new Error('Web Crypto not available');
    // Derive a key from the provided secret using SHA-256
    const enc = new TextEncoder();
    const secretBytes = enc.encode(this.CRYPTO_SECRET);
    const subtle = (globalThis.crypto as any).subtle || (globalThis.crypto as any).webkitSubtle;
    const hash = await subtle.digest('SHA-256', secretBytes);
    return subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async encryptUser(plaintext: string): Promise<{ iv: string; data: string }> {
    if (!this.webCryptoAvailable) throw new Error('Web Crypto not available');
    const key = await this.getKey();
    const iv = (globalThis.crypto as any).getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    const subtle = (globalThis.crypto as any).subtle || (globalThis.crypto as any).webkitSubtle;
    const cipher = await subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    return {
      iv: this.bufToB64(iv),
      data: this.bufToB64(new Uint8Array(cipher))
    };
  }

  private async decryptUser(payload: { iv: string; data: string }): Promise<string> {
    if (!this.webCryptoAvailable) throw new Error('Web Crypto not available');
    const key = await this.getKey();
    const ivArr = this.b64ToBuf(payload.iv);
    const dataArr = this.b64ToBuf(payload.data);
    const iv = ivArr.buffer.slice(ivArr.byteOffset, ivArr.byteOffset + ivArr.byteLength) as ArrayBuffer;
    const data = dataArr.buffer.slice(dataArr.byteOffset, dataArr.byteOffset + dataArr.byteLength) as ArrayBuffer;
    const subtle = (globalThis.crypto as any).subtle || (globalThis.crypto as any).webkitSubtle;
    const plainBuf = await subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return new TextDecoder().decode(plainBuf);
  }

  private bufToB64(buf: Uint8Array): string {
    let binary = '';
    buf.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }

  private b64ToBuf(b64: string): Uint8Array {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
}