import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div style="text-align: center; padding: 50px;">
      <h1>Access Denied</h1>
      <p>You don't have permission to access this resource.</p>
      <a routerLink="/dashboard" style="color: #3f51b5; text-decoration: none;">Go to Dashboard</a>
    </div>
  `
})
export class UnauthorizedComponent { }