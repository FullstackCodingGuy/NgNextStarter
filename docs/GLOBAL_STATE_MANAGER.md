# Global State Manager Documentation

## Overview

The Global State Manager is a comprehensive state management solution built with Angular Signals that provides reactive state management for user sessions, language selection, and theme management. It's designed to work seamlessly with both standalone Angular applications and Micro Frontend (MFE) components.

## Features

- **Reactive State Management**: Built with Angular Signals for optimal performance and reactivity
- **User Session Management**: Handles authentication state, user information, and permissions
- **Language Selection**: Supports multiple languages with RTL support and localStorage persistence
- **Theme Management**: Dynamic theme switching with dark/light mode and system preference detection
- **MFE Compatible**: Designed to work across different micro frontend boundaries
- **Persistence**: Automatic state persistence to localStorage
- **Type Safe**: Full TypeScript support with comprehensive interfaces

## Architecture

### Core Components

1. **GlobalStateService**: Main service that manages all state
2. **State Models**: TypeScript interfaces defining state structure
3. **Actions Interface**: Type-safe action methods for state updates
4. **Computed Signals**: Derived state values for optimal performance

## Usage

### Basic Setup

The service is automatically available application-wide through dependency injection:

```typescript
import { Component, inject } from '@angular/core';
import { GlobalStateService } from './core/services/global-state.service';

@Component({
  // component definition
})
export class MyComponent {
  private globalState = inject(GlobalStateService);
  
  // Access reactive state
  isAuthenticated = this.globalState.isAuthenticated;
  currentUser = this.globalState.currentUser;
  currentTheme = this.globalState.currentTheme;
  currentLanguage = this.globalState.currentLanguage;
}
```

### User Session Management

```typescript
// Check authentication status
const isAuth = this.globalState.isAuthenticated();

// Get current user
const user = this.globalState.currentUser();

// Get user display name
const displayName = this.globalState.userDisplayName();

// Check permissions
const canRead = this.globalState.hasPermission('read');
const canManage = this.globalState.hasAnyPermission(['admin', 'manager']);
const hasAllPerms = this.globalState.hasAllPermissions(['read', 'write']);

// Update activity timestamp
this.globalState.updateLastActivity();

// Clear session (usually handled by AuthService)
this.globalState.clearUserSession();
```

### Language Management

```typescript
// Get current language
const currentLang = this.globalState.currentLanguage();

// Check if current language is RTL
const isRTL = this.globalState.isRTLLanguage();

// Get available languages
const languages = this.globalState.availableLanguages();

// Change language
const spanishLang = languages.find(lang => lang.code === 'es');
if (spanishLang) {
  this.globalState.setLanguage(spanishLang);
}

// Check loading state
const isLoading = this.globalState.isLanguageLoading();
```

### Theme Management

```typescript
// Get current theme
const theme = this.globalState.currentTheme();

// Check if dark mode
const isDark = this.globalState.isDarkMode();

// Toggle dark/light mode
this.globalState.toggleDarkMode();

// Set specific theme
const darkTheme = this.globalState.availableThemes().find(t => t.id === 'dark');
if (darkTheme) {
  this.globalState.setTheme(darkTheme);
}

// Set system preference
this.globalState.setSystemPreference('auto'); // 'light' | 'dark' | 'auto'

// Get effective theme (considers system preference)
const effectiveTheme = this.globalState.effectiveTheme();
```

### State Export/Import (MFE Support)

```typescript
// Export current state for sharing between MFEs
const currentState = this.globalState.exportState();

// Import state from another MFE
this.globalState.importState({
  language: {
    current: spanishLanguage,
    available: availableLanguages,
    isLoading: false
  },
  theme: {
    current: darkTheme,
    available: availableThemes,
    isDark: true,
    systemPreference: 'dark'
  }
});

// Reset to default state
this.globalState.resetToDefaults();
```

## Integration with Components

### Template Usage

```html
<!-- User session display -->
<div *ngIf="globalState.isAuthenticated()">
  Welcome, {{ globalState.userDisplayName() }}!
</div>

<!-- Language selector -->
<select (change)="onLanguageChange($event.target.value)">
  <option 
    *ngFor="let lang of globalState.availableLanguages()" 
    [value]="lang.code"
    [selected]="lang.code === globalState.currentLanguage().code">
    {{ lang.name }}
  </option>
</select>

<!-- Theme toggle -->
<button (click)="globalState.toggleDarkMode()">
  {{ globalState.isDarkMode() ? 'Light' : 'Dark' }} Mode
</button>

<!-- Permission-based display -->
<div *ngIf="globalState.hasPermission('admin')">
  Admin only content
</div>
```

### Reactive Updates

```typescript
export class MyComponent {
  private globalState = inject(GlobalStateService);
  
  // These will automatically update when state changes
  userInfo = computed(() => {
    const user = this.globalState.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Guest';
  });
  
  themeClass = computed(() => {
    return this.globalState.currentTheme().cssClass;
  });
  
  // React to state changes
  constructor() {
    effect(() => {
      const theme = this.globalState.currentTheme();
      console.log('Theme changed to:', theme.displayName);
    });
  }
}
```

## State Structure

### Global State Interface

```typescript
interface GlobalState {
  userSession: UserSession;
  language: LanguageState;
  theme: ThemeState;
}
```

### User Session

```typescript
interface UserSession {
  isAuthenticated: boolean;
  user: UserInfo | null;
  permissions: string[];
  lastActivity: Date | null;
}
```

### Language State

```typescript
interface LanguageState {
  current: Language;
  available: Language[];
  isLoading: boolean;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}
```

### Theme State

```typescript
interface ThemeState {
  current: Theme;
  available: Theme[];
  isDark: boolean;
  systemPreference: 'light' | 'dark' | 'auto';
}

interface Theme {
  id: string;
  name: string;
  displayName: string;
  isDark: boolean;
  primary: string;
  accent: string;
  cssClass: string;
}
```

## CSS Theme Classes

The service automatically applies CSS classes to the document body:

```css
.light-theme {
  --primary-color: #1976d2;
  --accent-color: #ff4081;
  --background-color: #fafafa;
  color-scheme: light;
}

.dark-theme {
  --primary-color: #90caf9;
  --accent-color: #f48fb1;
  --background-color: #121212;
  color-scheme: dark;
}
```

## MFE Integration

### Sharing State Between MFEs

```typescript
// In Parent MFE
const parentState = globalStateService.exportState();
window.globalAppState = parentState;

// In Child MFE
if (window.globalAppState) {
  globalStateService.importState(window.globalAppState);
}
```

### Event-Based Communication

```typescript
// Emit state changes
window.dispatchEvent(new CustomEvent('globalStateChange', {
  detail: globalStateService.exportState()
}));

// Listen for state changes
window.addEventListener('globalStateChange', (event) => {
  globalStateService.importState(event.detail);
});
```

## Best Practices

1. **Use Computed Signals**: For derived state values to ensure optimal performance
2. **Avoid Direct State Mutation**: Always use provided action methods
3. **Handle Loading States**: Check `isLanguageLoading()` for better UX
4. **Implement Error Handling**: Wrap state operations in try-catch blocks
5. **Test State Changes**: Use the provided test utilities for unit testing
6. **MFE Communication**: Use the export/import methods for cross-MFE state sharing

## Testing

The service includes comprehensive test coverage. For testing in your components:

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: mockAuthService },
      provideHttpClient()
    ]
  });
  
  globalStateService = TestBed.inject(GlobalStateService);
});
```

## Performance Considerations

- Uses Angular Signals for optimal change detection
- Computed values are memoized automatically
- localStorage operations are batched
- Effects are disposed of automatically
- Tree-shakable design for smaller bundle sizes

## Browser Support

- Supports all modern browsers with Angular 16+ support
- Graceful fallback for localStorage unavailability
- RTL language support for international applications
- System theme preference detection (prefers-color-scheme)