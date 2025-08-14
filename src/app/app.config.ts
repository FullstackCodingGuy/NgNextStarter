import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { GlobalStateService } from './core/services/global-state.service';
import { securityInterceptor } from './core/interceptors/security.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './core/errors/global-error.handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  provideAnimations(),
  provideHttpClient(withInterceptors([securityInterceptor, authInterceptor])),
  { provide: ErrorHandler, useClass: GlobalErrorHandler },
    GlobalStateService // Ensure global state service is available app-wide
  ]
};
