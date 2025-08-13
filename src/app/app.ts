import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainLayoutComponent, AuthLayoutComponent, CommonModule],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('securities-app');

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initialize the app and handle initial navigation
    if (!this.authService.isAuthenticated() && !this.router.url.startsWith('/auth')) {
      this.router.navigate(['/auth/login']);
    }
  }
}
