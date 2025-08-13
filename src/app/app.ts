import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { GlobalStateService } from './core/services/global-state.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <div class="app-container" [class]="themeClass()">
      @if (globalState.isAuthenticated()) {
        <mat-toolbar color="primary" class="app-header">
          <span>Securities App</span>
          <span class="spacer"></span>
          
          <!-- Language and Theme Controls -->
          <button 
            mat-icon-button 
            (click)="globalState.toggleDarkMode()"
            [title]="globalState.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <mat-icon>{{ globalState.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
          
          <button 
            mat-button 
            (click)="navigateToDemo()"
            title="View Global State Manager Demo">
            <mat-icon>settings</mat-icon>
            Global State Demo
          </button>
          
          <!-- User Info -->
          <span class="user-info">
            Welcome, {{ globalState.userDisplayName() || 'User' }}!
          </span>
        </mat-toolbar>
      }
      
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--background-color);
      color: var(--text-primary);
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .user-info {
      margin-left: 16px;
      font-size: 14px;
    }
    
    .app-content {
      flex: 1;
      overflow-y: auto;
    }
    
    /* Theme-specific adjustments */
    .light-theme .app-header {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .dark-theme .app-header {
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  `],
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('securities-app');
  
  private router = inject(Router);
  private authService = inject(AuthService);
  public globalState = inject(GlobalStateService);
  
  // Computed theme class for dynamic styling
  themeClass = computed(() => this.globalState.currentTheme().cssClass);

  ngOnInit(): void {
    // Initialize the app and handle initial navigation
    if (!this.authService.isAuthenticated() && !this.router.url.startsWith('/auth')) {
      this.router.navigate(['/auth/login']);
    }
  }
  
  navigateToDemo(): void {
    this.router.navigate(['/global-state-demo']);
  }
}
