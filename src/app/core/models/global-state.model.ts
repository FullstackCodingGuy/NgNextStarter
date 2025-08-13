export interface GlobalState {
  userSession: UserSession;
  language: LanguageState;
  theme: ThemeState;
}

export interface UserSession {
  isAuthenticated: boolean;
  user: UserInfo | null;
  permissions: string[];
  lastActivity: Date | null;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

export interface LanguageState {
  current: Language;
  available: Language[];
  isLoading: boolean;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export interface ThemeState {
  current: Theme;
  available: Theme[];
  isDark: boolean;
  systemPreference: 'light' | 'dark' | 'auto';
}

export interface Theme {
  id: string;
  name: string;
  displayName: string;
  isDark: boolean;
  primary: string;
  accent: string;
  cssClass: string;
}

// Actions for state updates
export interface StateActions {
  // User Session Actions
  setUserSession: (session: Partial<UserSession>) => void;
  clearUserSession: () => void;
  updateLastActivity: () => void;
  
  // Language Actions
  setLanguage: (language: Language) => void;
  setLanguageLoading: (loading: boolean) => void;
  
  // Theme Actions
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
  setSystemPreference: (preference: 'light' | 'dark' | 'auto') => void;
}

// Default values
export const DEFAULT_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true }
];

export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'light',
    name: 'light',
    displayName: 'Light',
    isDark: false,
    primary: '#1976d2',
    accent: '#ff4081',
    cssClass: 'light-theme'
  },
  {
    id: 'dark',
    name: 'dark',
    displayName: 'Dark',
    isDark: true,
    primary: '#90caf9',
    accent: '#f48fb1',
    cssClass: 'dark-theme'
  },
  {
    id: 'blue',
    name: 'blue',
    displayName: 'Blue',
    isDark: false,
    primary: '#2196f3',
    accent: '#ff5722',
    cssClass: 'blue-theme'
  },
  {
    id: 'purple',
    name: 'purple',
    displayName: 'Purple',
    isDark: false,
    primary: '#673ab7',
    accent: '#cddc39',
    cssClass: 'purple-theme'
  }
];

// Initial state
export const INITIAL_GLOBAL_STATE: GlobalState = {
  userSession: {
    isAuthenticated: false,
    user: null,
    permissions: [],
    lastActivity: null
  },
  language: {
    current: DEFAULT_LANGUAGES[0], // English as default
    available: DEFAULT_LANGUAGES,
    isLoading: false
  },
  theme: {
    current: DEFAULT_THEMES[0], // Light theme as default
    available: DEFAULT_THEMES,
    isDark: false,
    systemPreference: 'auto'
  }
};