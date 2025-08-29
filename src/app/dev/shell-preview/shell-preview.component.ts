import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-shell-preview',
  standalone: true,
  imports: [RouterModule, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="page-container">
        <div class="page-card">
          <h2>Shell Preview</h2>
          <p>This page is for dev-only visual QA and screenshotting of the app shell.</p>
        </div>
      </div>
    </app-main-layout>
  `,
})
export class ShellPreviewComponent {}
