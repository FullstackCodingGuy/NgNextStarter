import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { GlobalStateService } from '../../core/services/global-state.service';

@Component({
  selector: 'app-global-state-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatIconModule,
    MatToolbarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header mb-4">
        <div>
          <h1 class="h1">Global State Manager Demo</h1>
          <div class="page-subtitle">Live session, theme, language, and permission controls</div>
        </div>
        <div class="user-summary">
          <span class="user-chip">
            <mat-icon>person</mat-icon>
            {{ globalState.userDisplayName() || 'Not Authenticated' }}
          </span>
        </div>
      </div>

      <div class="demo-content">
  <!-- User Session Card -->
  <div class="page-card demo-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>person</mat-icon>
              User Session
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="session-info">
              <p><strong>Authenticated:</strong> {{ globalState.isAuthenticated() ? 'Yes' : 'No' }}</p>
              @if (globalState.currentUser(); as user) {
                <p><strong>User:</strong> {{ user.firstName }} {{ user.lastName }}</p>
                <p><strong>Email:</strong> {{ user.email }}</p>
                <p><strong>Role:</strong> {{ user.role }}</p>
              }
              <p><strong>Last Activity:</strong> {{ formatDate(globalState.userSession().lastActivity) }}</p>
              
              <div class="permissions-section">
                <h4>Permissions:</h4>
                <mat-chip-set>
                  @for (permission of globalState.userPermissions(); track permission) {
                    <mat-chip>{{ permission }}</mat-chip>
                  }
                </mat-chip-set>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="updateActivity()">
              Update Activity
            </button>
            <button mat-raised-button color="warn" (click)="clearSession()">
              Clear Session
            </button>
          </mat-card-actions>
  </div>

  <!-- Language Selection Card -->
  <div class="page-card demo-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>language</mat-icon>
              Language Selection
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="language-info">
              <p><strong>Current Language:</strong> {{ globalState.currentLanguage().name }} ({{ globalState.currentLanguage().nativeName }})</p>
              <p><strong>RTL Language:</strong> {{ globalState.isRTLLanguage() ? 'Yes' : 'No' }}</p>
              <p><strong>Loading:</strong> {{ globalState.isLanguageLoading() ? 'Yes' : 'No' }}</p>
              
              <mat-form-field>
                <mat-label>Select Language</mat-label>
                <mat-select 
                  [value]="globalState.currentLanguage().code"
                  (selectionChange)="onLanguageChange($event.value)">
                  @for (language of globalState.availableLanguages(); track language.code) {
                    <mat-option [value]="language.code">
                      {{ language.name }} ({{ language.nativeName }})
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </mat-card-content>
  </div>

  <!-- Theme Selection Card -->
  <div class="page-card demo-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>palette</mat-icon>
              Theme Selection
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="theme-info">
              <p><strong>Current Theme:</strong> {{ globalState.currentTheme().displayName }}</p>
              <p><strong>Dark Mode:</strong> {{ globalState.isDarkMode() ? 'Yes' : 'No' }}</p>
              <p><strong>System Preference:</strong> {{ globalState.systemThemePreference() }}</p>
              
              <div class="theme-controls">
                <mat-slide-toggle 
                  [checked]="globalState.isDarkMode()"
                  (toggleChange)="globalState.toggleDarkMode()">
                  Dark Mode
                </mat-slide-toggle>
                
                <mat-form-field>
                  <mat-label>Select Theme</mat-label>
                  <mat-select 
                    [value]="globalState.currentTheme().id"
                    (selectionChange)="onThemeChange($event.value)">
                    @for (theme of globalState.availableThemes(); track theme.id) {
                      <mat-option [value]="theme.id">
                        {{ theme.displayName }} {{ theme.isDark ? '(Dark)' : '(Light)' }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field>
                  <mat-label>System Preference</mat-label>
                  <mat-select 
                    [value]="globalState.systemThemePreference()"
                    (selectionChange)="onSystemPreferenceChange($event.value)">
                    <mat-option value="light">Light</mat-option>
                    <mat-option value="dark">Dark</mat-option>
                    <mat-option value="auto">Auto (System)</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
          </mat-card-content>
  </div>

  <!-- State Export/Import Card -->
  <div class="page-card demo-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>import_export</mat-icon>
              State Management
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="state-controls">
              <button mat-raised-button color="primary" (click)="exportState()">
                Export State
              </button>
              <button mat-raised-button color="accent" (click)="resetToDefaults()">
                Reset to Defaults
              </button>
            </div>
            
            @if (exportedState) {
              <div class="exported-state">
                <h4>Exported State (JSON):</h4>
                <pre>{{ exportedState }}</pre>
              </div>
            }
          </mat-card-content>
  </div>

  <!-- Permission Testing Card -->
  <div class="page-card demo-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>security</mat-icon>
              Permission Testing
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="permission-tests">
              <p><strong>Has 'read' permission:</strong> {{ globalState.hasPermission('read') ? 'Yes' : 'No' }}</p>
              <p><strong>Has 'admin' permission:</strong> {{ globalState.hasPermission('admin') ? 'Yes' : 'No' }}</p>
              <p><strong>Has any ['admin', 'manager']:</strong> {{ globalState.hasAnyPermission(['admin', 'manager']) ? 'Yes' : 'No' }}</p>
              <p><strong>Has all ['read', 'write']:</strong> {{ globalState.hasAllPermissions(['read', 'write']) ? 'Yes' : 'No' }}</p>
            </div>
          </mat-card-content>
  </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .mb-4 { margin-bottom: var(--space-4); }
    .page-header {
      margin-top: var(--space-6);
      padding-left: var(--space-5);
      padding-right: var(--space-5);
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }
    .user-summary {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .user-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      background: color-mix(in srgb, var(--primary-color) 10%, var(--surface-color));
      color: var(--primary-color);
      border-radius: 16px;
      padding: 4px 12px;
      font-weight: 500;
      font-size: 15px;
    }
    .demo-content {
      padding: var(--space-5);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: var(--space-5);
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-card.demo-card {
      height: fit-content;
      box-shadow: var(--shadow-md);
      border-radius: var(--radius-md);
      transition: box-shadow 160ms, transform 160ms;
      will-change: box-shadow, transform;
      padding: var(--space-4) var(--space-5);
      background: color-mix(in srgb, var(--surface-color) 98%, var(--background-color));
    }
    .page-card.demo-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }
    .demo-card mat-card-header {
      margin-bottom: var(--space-4);
    }
    .demo-card mat-card-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--h3-size);
      font-weight: var(--font-weight-medium);
    }
    .session-info, .language-info, .theme-info {
      margin-bottom: var(--space-4);
      font-size: 15px;
      line-height: var(--body-line-height);
    }
    .permissions-section {
      margin-top: var(--space-4);
    }
    .permissions-section h4 {
      margin-bottom: var(--space-2);
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: var(--font-weight-medium);
    }
    .theme-controls {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .state-controls {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .exported-state {
      margin-top: var(--space-4);
    }
    .exported-state pre {
      background-color: var(--surface-color);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      max-height: 300px;
      font-size: 13px;
      color: var(--text-primary);
    }
    .permission-tests p {
      margin-bottom: 8px;
      font-size: 15px;
    }
    mat-form-field {
      width: 100%;
    }
    button:focus-visible {
      box-shadow: 0 0 0 4px var(--focus-ring-color);
      outline: none;
      border-radius: 8px;
    }
    @media (max-width: 599.98px) {
      .demo-content { grid-template-columns: 1fr; padding: var(--space-3); }
      .page-card.demo-card { padding: var(--space-3) var(--space-3); }
      .page-header {
        margin-top: var(--space-4);
        padding-left: var(--space-3);
        padding-right: var(--space-3);
      }
    }
  `]
})
export class GlobalStateDemoComponent {
  globalState = inject(GlobalStateService);
  exportedState: string | null = null;

  onLanguageChange(languageCode: string): void {
    const language = this.globalState.availableLanguages().find(lang => lang.code === languageCode);
    if (language) {
      this.globalState.setLanguage(language);
    }
  }

  onThemeChange(themeId: string): void {
    const theme = this.globalState.availableThemes().find(t => t.id === themeId);
    if (theme) {
      this.globalState.setTheme(theme);
    }
  }

  onSystemPreferenceChange(preference: 'light' | 'dark' | 'auto'): void {
    this.globalState.setSystemPreference(preference);
  }

  updateActivity(): void {
    this.globalState.updateLastActivity();
  }

  clearSession(): void {
    this.globalState.clearUserSession();
  }

  exportState(): void {
    const state = this.globalState.exportState();
    this.exportedState = JSON.stringify(state, null, 2);
  }

  resetToDefaults(): void {
    this.globalState.resetToDefaults();
    this.exportedState = null;
  }

  formatDate(date: Date | null): string {
    return date ? date.toLocaleString() : 'Never';
  }
}