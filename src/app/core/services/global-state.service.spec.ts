import { TestBed } from '@angular/core/testing';
import { GlobalStateService } from './global-state.service';
import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { DEFAULT_LANGUAGES, DEFAULT_THEMES } from '../models/global-state.model';

describe('GlobalStateService', () => {
  let service: GlobalStateService;
  let authService: jasmine.SpyObj<AuthService>;
  let mockUser: User;
  let currentUserSubject: BehaviorSubject<User | null>;

  beforeEach(() => {
    currentUserSubject = new BehaviorSubject<User | null>(null);
    
    mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.ANALYST,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      currentUser$: currentUserSubject.asObservable()
    });

    // Clear localStorage before each test
    localStorage.clear();

    // Reset TestBed for each test to ensure fresh instances
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideHttpClient()
      ]
    });
    
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    service = TestBed.inject(GlobalStateService);
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default state when no saved data exists', () => {
      // Ensure localStorage is clear
      localStorage.clear();
      
      // Create fresh service instance with mock auth service
      const freshService = new GlobalStateService(authService);
      const state = freshService.globalState();
      
      expect(state.userSession.isAuthenticated).toBeFalse();
      expect(state.userSession.user).toBeNull();
      expect(state.language.current).toEqual(DEFAULT_LANGUAGES[0]);
      expect(state.theme.current).toEqual(DEFAULT_THEMES[0]);
    });

    it('should load saved language from localStorage', () => {
      localStorage.clear();
      localStorage.setItem('app_language', 'es');
      
      // Create new service instance to test initialization
      const newService = new GlobalStateService(authService);
      
      expect(newService.currentLanguage().code).toBe('es');
    });

    it('should load saved theme from localStorage', () => {
      localStorage.clear();
      localStorage.setItem('app_theme', 'dark');
      
      // Create new service instance to test initialization
      const newService = new GlobalStateService(authService);
      
      expect(newService.currentTheme().id).toBe('dark');
    });
  });

  describe('User Session Management', () => {
    it('should update user session when auth service emits user', () => {
      currentUserSubject.next(mockUser);
      
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUser()?.email).toBe('test@example.com');
      expect(service.userDisplayName()).toBe('Test User');
    });

    it('should clear user session when auth service emits null', () => {
      // First set a user
      currentUserSubject.next(mockUser);
      expect(service.isAuthenticated()).toBeTrue();
      
      // Then clear it
      currentUserSubject.next(null);
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.currentUser()).toBeNull();
    });

    it('should update last activity', () => {
      const initialActivity = service.userSession().lastActivity;
      
      service.updateLastActivity();
      
      const updatedActivity = service.userSession().lastActivity;
      expect(updatedActivity).not.toBe(initialActivity);
      expect(updatedActivity).toBeInstanceOf(Date);
    });

    it('should assign correct permissions based on user role', () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      currentUserSubject.next(adminUser);
      
      const permissions = service.userPermissions();
      expect(permissions).toContain('admin');
      expect(permissions).toContain('read');
      expect(permissions).toContain('write');
      expect(permissions).toContain('delete');
    });
  });

  describe('Language Management', () => {
    it('should set language and persist to localStorage', (done) => {
      const spanishLang = DEFAULT_LANGUAGES.find(lang => lang.code === 'es')!;
      
      service.setLanguage(spanishLang);
      
      // Wait for async operation to complete
      setTimeout(() => {
        expect(service.currentLanguage()).toEqual(spanishLang);
        expect(localStorage.getItem('app_language')).toBe('es');
        expect(document.documentElement.lang).toBe('es');
        done();
      }, 150);
    });

    it('should set loading state during language change', () => {
      const spanishLang = DEFAULT_LANGUAGES.find(lang => lang.code === 'es')!;
      
      service.setLanguage(spanishLang);
      
      expect(service.isLanguageLoading()).toBeTrue();
    });

    it('should handle RTL languages correctly', (done) => {
      const arabicLang = DEFAULT_LANGUAGES.find(lang => lang.code === 'ar')!;
      
      service.setLanguage(arabicLang);
      
      setTimeout(() => {
        expect(service.isRTLLanguage()).toBeTrue();
        expect(document.documentElement.dir).toBe('rtl');
        done();
      }, 150);
    });
  });

  describe('Theme Management', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should set theme and persist to localStorage', () => {
      const darkTheme = DEFAULT_THEMES.find(theme => theme.id === 'dark')!;
      
      service.setTheme(darkTheme);
      
      expect(service.currentTheme()).toEqual(darkTheme);
      expect(service.isDarkMode()).toBeTrue();
      expect(localStorage.getItem('app_theme')).toBe('dark');
    });

    it('should toggle between light and dark themes', () => {
      // Ensure we start with light theme
      const lightTheme = DEFAULT_THEMES.find(theme => !theme.isDark)!;
      service.setTheme(lightTheme);
      expect(service.isDarkMode()).toBeFalse();
      
      // Toggle to dark
      service.toggleDarkMode();
      expect(service.isDarkMode()).toBeTrue();
      
      // Toggle back to light
      service.toggleDarkMode();
      expect(service.isDarkMode()).toBeFalse();
    });

    it('should set system preference and persist', () => {
      service.setSystemPreference('dark');
      
      expect(service.systemThemePreference()).toBe('dark');
      expect(localStorage.getItem('app_theme_preference')).toBe('dark');
    });

    it('should apply theme CSS classes to document body', () => {
      const darkTheme = DEFAULT_THEMES.find(theme => theme.id === 'dark')!;
      
      service.setTheme(darkTheme);
      
      expect(document.body.classList.contains(darkTheme.cssClass)).toBeTrue();
    });
  });

  describe('Permission Management', () => {
    beforeEach(() => {
      currentUserSubject.next(mockUser); // analyst role
    });

    it('should check single permission correctly', () => {
      expect(service.hasPermission('read')).toBeTrue();
      expect(service.hasPermission('admin')).toBeFalse();
    });

    it('should check any permission correctly', () => {
      expect(service.hasAnyPermission(['read', 'admin'])).toBeTrue();
      expect(service.hasAnyPermission(['admin', 'manage_users'])).toBeFalse();
    });

    it('should check all permissions correctly', () => {
      expect(service.hasAllPermissions(['read', 'write'])).toBeTrue();
      expect(service.hasAllPermissions(['read', 'admin'])).toBeFalse();
    });
  });

  describe('State Management', () => {
    it('should export current state', () => {
      const state = service.exportState();
      
      expect(state).toEqual(service.globalState());
      expect(state.userSession).toBeDefined();
      expect(state.language).toBeDefined();
      expect(state.theme).toBeDefined();
    });

    it('should import partial state', () => {
      const spanishLang = DEFAULT_LANGUAGES.find(lang => lang.code === 'es')!;
      const darkTheme = DEFAULT_THEMES.find(theme => theme.id === 'dark')!;
      
      service.importState({
        language: {
          current: spanishLang,
          available: DEFAULT_LANGUAGES,
          isLoading: false
        },
        theme: {
          current: darkTheme,
          available: DEFAULT_THEMES,
          isDark: true,
          systemPreference: 'dark'
        }
      });
      
      expect(service.currentLanguage()).toEqual(spanishLang);
      expect(service.currentTheme()).toEqual(darkTheme);
    });

    it('should reset to defaults', () => {
      // Set some non-default values
      const spanishLang = DEFAULT_LANGUAGES.find(lang => lang.code === 'es')!;
      const darkTheme = DEFAULT_THEMES.find(theme => theme.id === 'dark')!;
      
      service.setLanguage(spanishLang);
      service.setTheme(darkTheme);
      
      // Reset to defaults
      service.resetToDefaults();
      
      expect(service.currentLanguage()).toEqual(DEFAULT_LANGUAGES[0]);
      expect(service.currentTheme()).toEqual(DEFAULT_THEMES[0]);
      expect(localStorage.getItem('app_language')).toBeNull();
      expect(localStorage.getItem('app_theme')).toBeNull();
    });
  });
});