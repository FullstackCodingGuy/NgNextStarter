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
    <div class="demo-container">
      <mat-toolbar color="primary">
        <span>Global State Manager Demo</span>
        <span class="spacer"></span>
        <span>{{ globalState.userDisplayName() || 'Not Authenticated' }}</span>
      </mat-toolbar>

      <div class="demo-content">
        <!-- User Session Card -->
        <mat-card class="demo-card">
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
        </mat-card>

        <!-- Language Selection Card -->
        <mat-card class="demo-card">
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
        </mat-card>

        <!-- Theme Selection Card -->
        <mat-card class="demo-card">
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
        </mat-card>

        <!-- State Export/Import Card -->
        <mat-card class="demo-card">
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
        </mat-card>

        <!-- Permission Testing Card -->
        <mat-card class="demo-card">
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
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      min-height: 100vh;
      background-color: var(--background-color);
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .demo-content {
      padding: var(--space-5);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: var(--space-5);
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .demo-card {
      height: fit-content;
    }
    
    .demo-card mat-card-header {
      margin-bottom: var(--space-4);
    }
    
    .demo-card mat-card-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    
    .session-info, .language-info, .theme-info {
      margin-bottom: var(--space-4);
    }
    
    .permissions-section {
      margin-top: var(--space-4);
    }
    
    .permissions-section h4 {
      margin-bottom: var(--space-2);
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
      border-radius: 4px;
      overflow-x: auto;
      max-height: 300px;
      font-size: 12px;
    }
    
    .permission-tests p {
      margin-bottom: 8px;
    }
    
    mat-form-field {
      width: 100%;
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