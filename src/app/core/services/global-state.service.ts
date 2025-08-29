import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  GlobalState, 
  UserSession, 
  UserInfo, 
  Language, 
  Theme, 
  LanguageState, 
  ThemeState,
  StateActions,
  INITIAL_GLOBAL_STATE,
  DEFAULT_LANGUAGES,
  DEFAULT_THEMES
} from '../models/global-state.model';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService implements StateActions {
  private readonly STORAGE_KEYS = {
    LANGUAGE: 'app_language',
    THEME: 'app_theme',
    THEME_PREFERENCE: 'app_theme_preference'
  };

  private authService: AuthService;
  private isBrowser = false;

  // Core state signals
  private userSessionState = signal<UserSession>(INITIAL_GLOBAL_STATE.userSession);
  private languageState = signal<LanguageState>(INITIAL_GLOBAL_STATE.language);
  private themeState = signal<ThemeState>(INITIAL_GLOBAL_STATE.theme);

  // Public readonly signals
  readonly userSession = this.userSessionState.asReadonly();
  readonly language = this.languageState.asReadonly();
  readonly theme = this.themeState.asReadonly();

  // Computed signals for derived state
  readonly globalState = computed<GlobalState>(() => ({
    userSession: this.userSession(),
    language: this.language(),
    theme: this.theme()
  }));

  // User session computed signals
  readonly isAuthenticated = computed(() => this.userSession().isAuthenticated);
  readonly currentUser = computed(() => this.userSession().user);
  readonly userPermissions = computed(() => this.userSession().permissions);
  readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  });

  // Language computed signals
  readonly currentLanguage = computed(() => this.language().current);
  readonly availableLanguages = computed(() => this.language().available);
  readonly isLanguageLoading = computed(() => this.language().isLoading);
  readonly isRTLLanguage = computed(() => this.currentLanguage().isRTL);

  // Theme computed signals
  readonly currentTheme = computed(() => this.theme().current);
  readonly availableThemes = computed(() => this.theme().available);
  readonly isDarkMode = computed(() => this.theme().isDark);
  readonly systemThemePreference = computed(() => this.theme().systemPreference);
  readonly effectiveTheme = computed(() => {
    const themeState = this.theme();
    if (themeState.systemPreference === 'auto') {
      const prefersDark = this.isBrowser ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
      return prefersDark ?
        themeState.available.find(t => t.isDark) || DEFAULT_THEMES[1] :
        themeState.available.find(t => !t.isDark) || DEFAULT_THEMES[0];
    }
    return themeState.current;
  });

  constructor(authService?: AuthService, private permissionService?: PermissionService) {
    this.authService = authService || inject(AuthService);

    // detect browser platform; fall back to runtime checks
    try {
      const platformId = (typeof inject !== 'undefined') ? inject(PLATFORM_ID) : undefined;
      this.isBrowser = platformId ? isPlatformBrowser(platformId) : (typeof window !== 'undefined' && typeof document !== 'undefined');
    } catch {
      this.isBrowser = (typeof window !== 'undefined' && typeof document !== 'undefined');
    }

    this.initializeState();
    this.setupAuthIntegration();

    // Only setup effects if running in a proper Angular injection context
    if (typeof inject !== 'undefined') {
      try {
        this.setupEffects();
      } catch {
        // In some test environments, effects may not be available. Fail silently.
      }
    }
  }

  // User Session Actions
  setUserSession(session: Partial<UserSession>): void {
    this.userSessionState.update(current => ({
      ...current,
      ...session
    }));
  }

  clearUserSession(): void {
    this.userSessionState.set(INITIAL_GLOBAL_STATE.userSession);
  }

  updateLastActivity(): void {
    this.userSessionState.update(current => ({
      ...current,
      lastActivity: new Date()
    }));
  }

  // Language Actions
  setLanguage(language: Language): void {
    this.setLanguageLoading(true);
    
    // Simulate async language loading
    setTimeout(() => {
      this.languageState.update(current => ({
        ...current,
        current: language,
        isLoading: false
      }));
      if (this.isBrowser) {
        try { localStorage.setItem(this.STORAGE_KEYS.LANGUAGE, language.code); } catch {}
        try {
          document.documentElement.lang = language.code;
          document.documentElement.dir = language.isRTL ? 'rtl' : 'ltr';
        } catch {}
      }
    }, 100);
  }

  setLanguageLoading(loading: boolean): void {
    this.languageState.update(current => ({
      ...current,
      isLoading: loading
    }));
  }

  // Theme Actions
  setTheme(theme: Theme): void {
    this.themeState.update(current => ({
      ...current,
      current: theme,
      isDark: theme.isDark
    }));
    
    if (this.isBrowser) {
      try { localStorage.setItem(this.STORAGE_KEYS.THEME, theme.id); } catch {}
      this.applyThemeToDocument(theme);
    }
  }

  toggleDarkMode(): void {
    const currentTheme = this.currentTheme();
    const availableThemes = this.availableThemes();
    
    if (currentTheme.isDark) {
      // Switch to light theme
      const lightTheme = availableThemes.find(t => !t.isDark) || DEFAULT_THEMES[0];
      this.setTheme(lightTheme);
    } else {
      // Switch to dark theme
      const darkTheme = availableThemes.find(t => t.isDark) || DEFAULT_THEMES[1];
      this.setTheme(darkTheme);
    }
  }

  setSystemPreference(preference: 'light' | 'dark' | 'auto'): void {
    this.themeState.update(current => ({
      ...current,
      systemPreference: preference
    }));
    
    if (this.isBrowser) {
      try { localStorage.setItem(this.STORAGE_KEYS.THEME_PREFERENCE, preference); } catch {}
      if (preference === 'auto') {
        const effectiveTheme = this.effectiveTheme();
        this.applyThemeToDocument(effectiveTheme);
      }
    }
  }

  // Utility methods
  hasPermission(permission: string): boolean {
    return this.userPermissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPerms = this.userPermissions();
    return permissions.some(perm => userPerms.includes(perm));
  }

  hasAllPermissions(permissions: string[]): boolean {
    const userPerms = this.userPermissions();
    return permissions.every(perm => userPerms.includes(perm));
  }

  resetToDefaults(): void {
    // Clear persisted data (guard for SSR)
    if (this.isBrowser) {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        try { localStorage.removeItem(key); } catch {}
      });
    }
    
    // Reset state
    this.languageState.set(INITIAL_GLOBAL_STATE.language);
    this.themeState.set(INITIAL_GLOBAL_STATE.theme);
    
    // Don't reset user session as it should be handled by auth
    this.initializeState();
  }

  // Export state for debugging or MFE sharing
  exportState(): GlobalState {
    return this.globalState();
  }

  // Import state for MFE integration
  importState(state: Partial<GlobalState>): void {
    if (state.language) {
      this.languageState.set(state.language);
    }
    if (state.theme) {
      this.themeState.set(state.theme);
    }
    // Note: userSession should typically not be imported directly
    // as it should come from AuthService
  }

  private initializeState(): void {
    this.initializeLanguage();
    this.initializeTheme();
  }

  private initializeLanguage(): void {
    if (!this.isBrowser) return;
    try {
      const savedLanguageCode = localStorage.getItem(this.STORAGE_KEYS.LANGUAGE);
      if (savedLanguageCode) {
        const savedLanguage = DEFAULT_LANGUAGES.find(lang => lang.code === savedLanguageCode);
        if (savedLanguage) {
          this.languageState.update(current => ({
            ...current,
            current: savedLanguage
          }));
          try {
            document.documentElement.lang = savedLanguage.code;
            document.documentElement.dir = savedLanguage.isRTL ? 'rtl' : 'ltr';
          } catch {}
        }
      }
    } catch {}
  }

  private initializeTheme(): void {
    if (!this.isBrowser) return;
    try {
      const savedThemeId = localStorage.getItem(this.STORAGE_KEYS.THEME);
      const savedPreference = (localStorage.getItem(this.STORAGE_KEYS.THEME_PREFERENCE) as 'light' | 'dark' | 'auto') || 'auto';

      this.themeState.update(current => ({
        ...current,
        systemPreference: savedPreference
      }));

      if (savedThemeId) {
        const savedTheme = DEFAULT_THEMES.find(theme => theme.id === savedThemeId);
        if (savedTheme) {
          this.setTheme(savedTheme);
          return;
        }
      }

      // Apply default theme based on system preference
      const effectiveTheme = this.effectiveTheme();
      this.applyThemeToDocument(effectiveTheme);
    } catch {}
  }

  private setupEffects(): void {
    // Auto-update last activity on user interaction
    effect(() => {
      if (this.isAuthenticated()) {
        this.updateLastActivity();
      }
    });

    // Listen for system theme changes when in auto mode
    effect(() => {
      if (this.systemThemePreference() === 'auto') {
        if (!this.isBrowser) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
          const effectiveTheme = this.effectiveTheme();
          this.applyThemeToDocument(effectiveTheme);
        };

        mediaQuery.addEventListener('change', handleChange);

        // Cleanup function for effect disposal
        return () => {
          try { mediaQuery.removeEventListener('change', handleChange); } catch {}
        };
      }
      return; // Explicit return for when condition is not met
    });

    // Apply theme changes to document
    effect(() => {
      const theme = this.effectiveTheme();
      this.applyThemeToDocument(theme);
    });
  }

  private setupAuthIntegration(): void {
    // Subscribe to auth service changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const userInfo: UserInfo = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: undefined // Add avatar support later if needed
        };

        this.setUserSession({
          isAuthenticated: true,
          user: userInfo,
          permissions: this.permissionService ? [...this.permissionService.getPermissionsForUser(user)] : this.getUserPermissions(user),
          lastActivity: new Date()
        });
      } else {
        this.clearUserSession();
      }
    });
  }

  private getUserPermissions(user: User): string[] {
    // Fallback mapping in case PermissionService isn't injected
    const rolePermissions: { [key: string]: string[] } = {
      'admin': ['banking.read', 'banking.write', 'users.manage', 'settings.manage'],
      'manager': ['banking.read', 'banking.write'],
      'analyst': ['banking.read'],
      'viewer': ['banking.read']
    };
    return rolePermissions[user.role] || ['banking.read'];
  }

  private applyThemeToDocument(theme: Theme): void {
    if (!this.isBrowser) return;

    try {
      // Remove all theme classes
      DEFAULT_THEMES.forEach(t => {
        document.body.classList.remove(t.cssClass);
      });

      // Add current theme class
      document.body.classList.add(theme.cssClass);

      // Update CSS custom properties for dynamic theming
      try {
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--accent-color', theme.accent);
      } catch {}

      // Update theme-color meta tag for PWA support
      try {
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', theme.primary);
        }
      } catch {}
    } catch {}
  }
}