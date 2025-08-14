import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-form-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-form" [class.compact]="compact">
      <header class="form-header">
        <div class="title">
          <h2>{{ title }}</h2>
          <p *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <div class="action">
          <ng-content select="[action]"></ng-content>
        </div>
      </header>

      <section class="content">
        <ng-content></ng-content>
      </section>

      <footer class="links">
        <ng-content select="[links]"></ng-content>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: var(--font-family); }
    .auth-form { display: grid; gap: var(--auth-gap, 16px); }
    .auth-form.compact { --auth-gap: 12px; }

    .form-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .form-header .action:empty { display: none; }

    .title h2 { margin: 0; font-size: clamp(18px, 1.2vw + 14px, 22px); letter-spacing: -0.01em; font-weight: 600; }
    .title p { margin: 4px 0 0 0; color: var(--text-secondary); font-size: 13px; }

    .content { display: grid; gap: 12px; }

    .links { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 4px; font-size: 14px; color: var(--text-secondary); }
    .links a { color: var(--text-secondary); text-decoration: none; }
    .links a:hover { color: var(--text-primary); text-decoration: underline; }
  `]
})
export class AuthFormShellComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() compact = false;
}
