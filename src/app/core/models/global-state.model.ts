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

  // Core brand colors
  primary: string;
  accent: string;

  // Surface and text system (used as CSS variables)
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;

  // CSS class to toggle
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

// Centralized, easy-to-edit theme presets
export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'light',
    name: 'light',
    displayName: 'Light',
    isDark: false,
    primary: '#0f62fe',
    accent: '#8a3ffc',
    background: '#f7f7f9',
    surface: '#ffffff',
    textPrimary: '#101828',
    textSecondary: '#667085',
    border: '#e4e7ec',
    cssClass: 'light-theme'
  },
  {
    id: 'dark',
    name: 'dark',
    displayName: 'Dark',
    isDark: true,
    primary: '#8ab4ff',
    accent: '#c3a6ff',
    background: '#0b0f17',
    surface: '#121826',
    textPrimary: '#f2f4f7',
    textSecondary: '#98a2b3',
    border: '#243041',
    cssClass: 'dark-theme'
  },
  {
    id: 'blue',
    name: 'blue',
    displayName: 'Blue',
    isDark: false,
    primary: '#0f62fe',
    accent: '#ff6a3d',
    background: '#f3f8ff',
    surface: '#ffffff',
    textPrimary: '#102a43',
    textSecondary: '#486581',
    border: '#dce6f2',
    cssClass: 'blue-theme'
  },
  {
    id: 'purple',
    name: 'purple',
    displayName: 'Purple',
    isDark: false,
    primary: '#8a3ffc',
    accent: '#12b76a',
    background: '#f8f5ff',
    surface: '#ffffff',
    textPrimary: '#3d2c8d',
    textSecondary: '#6e59a5',
    border: '#e8e4f8',
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