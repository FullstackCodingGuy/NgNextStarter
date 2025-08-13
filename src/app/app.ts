import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { GlobalStateService } from './core/services/global-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container" [class]="themeClass()">
      <router-outlet></router-outlet>
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
  `],
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('ngNextStarter');

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
