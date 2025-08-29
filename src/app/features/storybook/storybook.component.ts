import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-storybook',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Storybook</h1>
        <p class="page-subtitle">Component samples and layout playground</p>
      </div>
    </header>

    <div class="page-card">
      <h2 class="h2">Grid samples</h2>
      <p class="muted">12-column responsive grid helper demo</p>
      <div class="grid-12 story-grid">
        <div class="col card">1</div>
        <div class="col card">2</div>
        <div class="col card">3</div>
        <div class="col card">4</div>
        <div class="col card">5</div>
        <div class="col card">6</div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host{display:block}
    .story-grid { grid-auto-rows: minmax(80px, auto); }
    .story-grid .col { background: color-mix(in srgb, var(--surface-color) 96%, var(--background-color)); border:1px solid color-mix(in srgb, var(--border-color) 60%, transparent); border-radius:8px; padding:12px; display:flex; align-items:center; justify-content:center; }
    .story-grid .col.card { box-shadow: var(--shadow-sm); }
    /* make 6 equal columns for demo using span across the 12-col grid */
    .story-grid .col { grid-column: span 2; }
    @media (max-width:720px){ .story-grid .col { grid-column: span 12; } }
  `]
})
export class StorybookComponent {}
