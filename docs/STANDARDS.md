# ngNextStarter Standards: Security and Theming

Purpose
- Make this repo a production-ready starter for secure, highly sensitive apps.
- Provide clear, centralized theming and consistent typography.
- Track security hardening tasks with status labels.

Status legend
- [TODO] Not started | [WIP] In progress | [IN REVIEW] Awaiting review | [BLOCKED] External dependency | [DONE] Completed

---

Frontend Theming and Typography

T1. Single source of truth for theme tokens
- Status: [DONE] | Owner: — | Target: —
- What: Centralize CSS variables and theme classes in src/styles/theme.scss.
- How:
  - Use --font-family, --primary-color, --accent-color, --text-primary, --text-secondary, --background-color, --surface-color, --border-color, and radius/shadow tokens.
  - Theme classes (.light-theme, .dark-theme, .blue-theme, .purple-theme) only set variables.
- Example usage:
  - Body and components read color/typography via var(--token). No hardcoded hex values.

T2. Consistent font family across app
- Status: [DONE] | Owner: — | Target: —
- What: Use Inter everywhere via --font-family.
- How: src/styles.scss sets body { font-family: var(--font-family) }. Component styles should not override font-family.

T3. Remove hardcoded colors from components
- Status: [WIP] | Owner: — | Target: —
- What: Replace literals (#3f51b5, #4caf50, #f44336, #666, #e0e0e0, etc.) with tokens.
- Current delta:
  - Updated: Dashboard, Register, Unauthorized, Layouts.
  - Pending: Review any remaining components for color literals.

T4. Easy theme customization
- Status: [DONE] | Owner: — | Target: —
- What: Edit src/styles/theme.scss only to change brand look. GlobalState applies theme classes to body.
- Tip: Change --primary-color and --accent-color to rebrand. Add a new theme by introducing a class and Theme in DEFAULT_THEMES.

T5. App title and description
- Status: [DONE] | Owner: — | Target: —
- What: Title set to ngNextStarter; meta description added in index.html for SEO.

---

Security Hardening (Frontend Scope)

S1. BFF + Cookie-based session
- Status: [TODO] | Owner: ___ | Target: ___
- Use OIDC Authorization Code + PKCE server-side; send withCredentials from Angular.

S2. Security HTTP interceptor
- Status: [DONE] | Owner: — | Target: —
- Add withCredentials, X-Request-ID, safe retry for GET, and friendly error mapping.

S3. Global error handler with PII redaction
- Status: [DONE] | Owner: — | Target: —
- Centralize ErrorHandler; scrub emails, PAN, SSN before sending telemetry.

S4. Strict CSP and security headers
- Status: [WIP] | Owner: ___ | Target: ___
- Dev meta CSP; prod via edge. Deny framing, block mixed content, set HSTS/Referrer-Policy.

S5. Route guards and fine-grained UI auth
- Status: [WIP] | Owner: ___ | Target: ___
- Gate sensitive routes by roles; API must re-check on server.

S6. No sensitive data in Web Storage
- Status: [DONE] | Owner: — | Target: —
- Tokens/PII must not be stored in LocalStorage/SessionStorage/IndexedDB.

S7. PWA caching policy
- Status: [TODO] | Owner: ___ | Target: ___
- Don’t cache /api responses in service worker; cache static assets only.

S8. Supply chain hygiene
- Status: [WIP] | Owner: ___ | Target: ___
- Use npm ci, npm audit --audit-level=high, generate SBOM (CycloneDX), enable Renovate.

S9. A11y and secure UX
- Status: [WIP] | Owner: ___ | Target: ___
- WCAG 2.2 AA, focus management; step-up auth on risky flows.

---

Quick customization guide
- Change brand colors: edit --primary-color and --accent-color in src/styles/theme.scss.
- Switch theme programmatically: GlobalStateService.setTheme(theme) or toggleDarkMode().
- Add a new theme:
  1) Add a class with variables in theme.scss (e.g., .green-theme {...}).
  2) Add a Theme in DEFAULT_THEMES (src/app/core/models/global-state.model.ts) with cssClass: 'green-theme'.
  3) Expose it in any theme picker UI if present.
- Typography: change --font-family in theme.scss and ensure index.html includes the font if remote.

Component style checklist
- Use var(--text-primary/secondary) for text colors.
- Use var(--primary-color/--accent-color) for emphasis and links.
- Use var(--surface-color) for cards and var(--border-color) for borders.
- Never hardcode hex colors; prefer tokens.
- Avoid inline styles; use classes and component styles.

Validation steps
- Build passes: ng build (production) — ensure no SCSS errors.
- Visual pass: navigate login, register, dashboard; verify consistent font and colors in light/dark themes.
- Theming smoke: change --primary-color in theme.scss; see brand update without code changes.

Appendix: Planned code scaffolding (optional)
- Interceptor: src/app/core/interceptors/security.interceptor.ts
- Error Handler: src/app/core/errors/global-error.handler.ts
- Role Guard: src/app/core/guards/role.guard.ts
- Idle Timer: src/app/core/security/idle-timeout.service.ts
# Frontend Security Standards and Hardening Guide

Purpose
- Establish actionable frontend security standards for high-security, highly sensitive banking workloads.
- Provide step-by-step tasks with examples, owners, and status labels for tracking.

How to use
- Each item has a status label: [TODO], [WIP], [IN REVIEW], [BLOCKED], [DONE].
- Assign an Owner and Target date. Update status as you progress.

Status legend
- [TODO] Not started
- [WIP] In progress
- [IN REVIEW] Awaiting review/approval
- [BLOCKED] Blocked by dependency/external
- [DONE] Completed and verified

--------------------------------------------------------------------------------

1) Authentication, Session, and Authorization (UI)

1.1 Adopt BFF pattern with cookie session
- Status: [TODO] | Owner: ___ | Target: ___
- Rationale: Keep tokens server-side; the browser holds only HttpOnly, Secure, SameSite=Strict cookies.
- Steps:
  - Use OIDC Authorization Code + PKCE on the server (BFF).
  - From Angular, call only your BFF domain via XHR/fetch with withCredentials: true.
  - Ensure API sets:
    - Set-Cookie: session=...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=...
  - Disable LocalStorage/SessionStorage for tokens.
- Example (interceptor):
  - See 4.1 Security HTTP Interceptor.

1.2 Session management UX
- Status: [TODO] | Owner: ___ | Target: ___
- Steps:
  - Idle timeout prompt (e.g., warn at 12m, logout at 15m).
  - Absolute session max (e.g., 8h).
  - Re-auth (step-up) before sensitive actions (beneficiary add, large transfers).
- Example (idle timer service, minimal):
```typescript
// filepath: /Users/dhamodharabalaji/Desktop/Workspace/Github/NgNextStarter/src/app/core/security/idle-timeout.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Subject, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IdleTimeoutService {
  private idleMs = 15 * 60_000; // 15 min
  private warnMs = 12 * 60_000; // 12 min
  private activityEvents = ['click', 'keypress', 'mousemove', 'scroll', 'touchstart'];
  warn$ = new Subject<void>();
  timeout$ = new Subject<void>();
  private idleTimer?: any;
  private warnTimer?: any;

  constructor(private zone: NgZone) { this.bindActivity(); }

  private bindActivity() {
    this.zone.runOutsideAngular(() => {
      this.activityEvents.forEach(e =>
        window.addEventListener(e, () => this.resetTimers(), { passive: true })
      );
    });
    this.resetTimers();
  }

  private resetTimers() {
    clearTimeout(this.idleTimer); clearTimeout(this.warnTimer);
    this.warnTimer = setTimeout(() => this.warn$.next(), this.warnMs);
    this.idleTimer = setTimeout(() => this.timeout$.next(), this.idleMs);
  }
}
```

1.3 UI authorization and route guards
- Status: [WIP] | Owner: ___ | Target: ___
- Steps:
  - Gate routes with roles/scopes (never rely only on UI; server must re-check).
  - Hide or disable forbidden UI controls.
- Example usage:
```typescript
// filepath: /Users/dhamodharabalaji/Desktop/Workspace/Github/NgNextStarter/src/app/app.routes.ts
// ...existing code...
import { roleGuard } from './app/core/guards/role.guard';

export const routes = [
  // ...existing code...
  {
    path: 'users',
    canActivate: [roleGuard(['admin','manager'])],
    loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
  }
];
```

--------------------------------------------------------------------------------

2) Cross-Site Scripting (XSS), CSP, Clickjacking

2.1 Strict Content Security Policy
- Status: [WIP] | Owner: ___ | Target: ___
- Principles:
  - default-src 'self'
  - No inline scripts or eval; avoid third-party scripts by default.
  - frame-ancestors 'none' to prevent clickjacking.
  - Enforce Trusted Types and block mixed content.
- Dev (meta) for local validation; Prod via edge headers:
```html
// filepath: /Users/dhamodharabalaji/Desktop/Workspace/Github/NgNextStarter/src/index.html
<!-- Dev-only CSP (use headers in prod) -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self' https://api.yourbank.example;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  require-trusted-types-for 'script';
  trusted-types angular angular#unsafe-bypass;
  upgrade-insecure-requests;
">
```
- Production headers (at CDN/reverse proxy):
  - Content-Security-Policy: as above
  - X-Frame-Options: DENY (optional when frame-ancestors set)
  - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  - Referrer-Policy: no-referrer
  - Permissions-Policy: camera=(), microphone=(), geolocation=(), usb=()
  - X-Content-Type-Options: nosniff
  - Cross-Origin-Opener-Policy: same-origin
  - Cross-Origin-Resource-Policy: same-site

2.2 Angular template hygiene
- Status: [TODO] | Owner: ___ | Target: ___
- Do:
  - Prefer property bindings [attr] and [style] over innerHTML.
  - If innerHTML is required, sanitize on server and avoid bypassSecurityTrust*; if unavoidable, strictly allowlist.
- Example:
```html
<!-- Safe binding -->
<div [textContent]="safeMessage"></div>

<!-- Avoid unless sanitized & allowlisted -->
<div [innerHTML]="dangerousHtml"></div>
```

2.3 Self-host fonts/icons; avoid CDNs
- Status: [DONE] | Owner: — | Target: —
- Steps:
  - npm i @fortawesome/fontawesome-free (already added)
  - Styles wired under angular.json; CDN link removed from index.html.
- Example:
```json
// filepath: /Users/dhamodharabalaji/Desktop/Workspace/Github/NgNextStarter/angular.json
{
  // ...existing code...
  "build": {
    "options": {
      "styles": [
        "src/styles.css",
        "node_modules/@fortawesome/fontawesome-free/css/all.min.css"
      ]
    }
  }
}
```

--------------------------------------------------------------------------------

3) CSRF, CORS, and HTTP Layer Hardening

3.1 CSRF protection with same-site cookies and BFF
- Status: [TODO] | Owner: ___ | Target: ___
- Steps:
  - Use SameSite=Strict cookies for session.
  - For cross-site cases or payment approvals, include anti-CSRF token synchronized with a cookie (double submit) or stateful server validation.
  - Always send credentials explicitly (withCredentials: true).

3.2 CORS configuration
- Status: [TODO] | Owner: ___ | Target: ___
- API must allow:
  - Access-Control-Allow-Origin: https://app.yourbank.example (exact, not *)
  - Access-Control-Allow-Credentials: true
  - Limit allowed methods and headers.

3.3 Security HTTP interceptor
- Status: [WIP] | Owner: ___ | Target: ___
- Adds withCredentials, correlation ID, safe retry, and error mapping.
```typescript
// filepath: /Users/dhamodharabalaji/Desktop/Workspace/Github/NgNextStarter/src/app/core/interceptors/security.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { catchError, retry, throwError } from 'rxjs';

export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationId = uuidv4();
  const secureReq = req.clone({
    withCredentials: true,
    setHeaders: { 'X-Request-ID': correlationId }
  });
  return next(secureReq).pipe(
    retry(req.method === 'GET' ? 2 : 0),
    catchError((err: HttpErrorResponse) => {
      const safeMessage = err.status === 0
        ? 'Network error. Please try again.'
        : 'Request failed. Please contact support if this persists.';
      return throwError(() => ({ ...err, safeMessage, correlationId }));
    })
  );
};
```
- Register with provideHttpClient(withInterceptors([securityInterceptor])).

--------------------------------------------------------------------------------

4) Error Handling and Telemetry

4.1 Centralized error handler with PII redaction
- Status: [WIP] | Owner: ___ | Target: ___
```typescript
// filepath: /Users/dhamodharabalaji/Desktop/Workspace/Github/NgNextStarter/src/app/core/errors/global-error.handler.ts
import { ErrorHandler, Injectable, isDevMode } from '@angular/core';

const redact = (msg: unknown) => {
  const s = typeof msg === 'string' ? msg : JSON.stringify(msg ?? {});
  return s.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[redacted-email]')
          .replace(/\b\d{12,19}\b/g, '[redacted-pan]')
          .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[redacted-ssn]');
};

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const payload = { message: redact(error), ts: Date.now() };
    // send to SIEM/APM with sampling and no PII
    // apm.captureError(payload);
    if (isDevMode()) {
      // eslint-disable-next-line no-console
      console.error('Error:', payload);
    }
  }
}
```
- Provide it in app.config.ts: { provide: ErrorHandler, useClass: GlobalErrorHandler }

4.2 Logging policy
- Status: [TODO] | Owner: ___ | Target: ___
- No console.log in production. Use a Logger service with levels; strip in prod.
- Redact PII in logs and analytics. Avoid recording keystrokes or full DOM in RUM.

--------------------------------------------------------------------------------

5) Data Handling and Storage

5.1 No sensitive data in Web Storage
- Status: [DONE] | Owner: ___ | Target: ___
- Do not store tokens, PANs, SSNs, or PII in LocalStorage/SessionStorage/IndexedDB.

5.2 Mask/redact sensitive UI fields
- Status: [TODO] | Owner: ___ | Target: ___
- Steps:
  - Use inputmode, autocomplete="off", and masking formats.
  - Display only last 4 digits when showing PANs or account numbers.
- Example:
```html
<input type="password" autocomplete="new-password" inputmode="numeric" maxlength="6" aria-label="OTP">
<!-- Display -->
<span>Account: •••• {{ account.last4 }}</span>
```

5.3 Download and cache policy
- Status: [TODO] | Owner: ___ | Target: ___
- Prevent caching of PII pages by proxies (server header). Do not enable “remember me” for high-risk actions.

--------------------------------------------------------------------------------

6) PWA/Service Worker (if enabled)

6.1 Do not cache authenticated API responses
- Status: [TODO] | Owner: ___ | Target: ___
- Steps:
  - In ngsw-config.json, cache only static assets; exclude /api.
- Example:
```json
// filepath: /Users/dhamodharabalaji/Desktop/Workspace/Github/NgNextStarter/ngsw-config.json
{
  "index": "/index.html",
  "assetGroups": [
    { "name": "app", "installMode": "prefetch", "resources": { "files": ["/favicon.ico","/index.html","/*.css","/*.js"] } },
    { "name": "assets", "installMode": "lazy", "updateMode": "prefetch", "resources": { "files": ["/assets/**"] } }
  ],
  "dataGroups": [
    {
      "name": "api-no-cache",
      "urls": [ "/api/**" ],
      "cacheConfig": { "strategy": "freshness", "maxSize": 0, "maxAge": "0u", "timeout": "5s" }
    }
  ]
}
```

--------------------------------------------------------------------------------

7) Build and Supply Chain Security

7.1 Deterministic installs and audits
- Status: [WIP] | Owner: ___ | Target: ___
- Use npm ci in CI.
- Run npm audit --audit-level=high; triage exceptions.
- Add Snyk or GH security scan; break build on criticals.

7.2 SBOM generation
- Status: [TODO] | Owner: ___ | Target: ___
- Generate CycloneDX SBOM:
  - npx @cyclonedx/cyclonedx-npm --output-format json --output-file sbom.json

7.3 Dependency pinning and updates
- Status: [TODO] | Owner: ___ | Target: ___
- Enable Renovate/Dependabot; review PRs weekly.
- Pin risky transitive deps; remove unused packages.

7.4 Production build hardening
- Status: [WIP] | Owner: ___ | Target: ___
- Angular build settings:
  - optimization: true
  - outputHashing: all
  - vendorChunk: false
  - sourceMap: false (or upload privately to error tracker)
  - budgets configured
- Command (macOS):
  - npm run build -- --configuration production

--------------------------------------------------------------------------------

8) Network and Edge Security (frontend requirements on server/CDN)

8.1 Security headers (required)
- Status: [TODO] | Owner: ___ | Target: ___
- See 2.1 for CSP, plus:
  - Strict-Transport-Security, Referrer-Policy, X-Content-Type-Options, COOP, CORP.
- Ensure HSTS preload if domain permits.

8.2 Rate limiting and WAF
- Status: [BLOCKED] | Owner: ___ | Target: ___
- Work with platform team to enforce WAF, bot management, and per-IP/user rate limits.

--------------------------------------------------------------------------------

9) UX Safeguards for Sensitive Actions

9.1 Step-up authentication for risky flows
- Status: [TODO] | Owner: ___ | Target: ___
- Show modal requiring MFA/WebAuthn before:
  - Beneficiary add, large wires, changing limits, profile PII edits.

9.2 Transaction review and confirmation
- Status: [TODO] | Owner: ___ | Target: ___
- Show summary with anti-tamper hints and confirmation codes.

9.3 Copy/paste and display protections
- Status: [TODO] | Owner: ___ | Target: ___
- Disable paste on OTP input; avoid showing full PAN/SSN; prevent screen readers from reading secrets using aria-hidden when needed (balance with a11y).

--------------------------------------------------------------------------------

10) Testing, Monitoring, and Processes

10.1 Security E2E tests
- Status: [TODO] | Owner: ___ | Target: ___
- Add Playwright tests:
  - Auth flow, route guard bypass, CSRF behavior (token presence), role-based visibility.

10.2 Accessibility (WCAG 2.2 AA) and secure UX
- Status: [WIP] | Owner: ___ | Target: ___
- Run automated checks (Lighthouse, axe). Ensure focus management for modals and step-up flows.

10.3 DAST and CSP regression
- Status: [TODO] | Owner: ___ | Target: ___
- OWASP ZAP baseline scan on dev URL.
- Automated check that CSP headers are present and strict.

10.4 Threat modeling and reviews
- Status: [IN REVIEW] | Owner: ___ | Target: ___
- STRIDE per feature. Record mitigations and residual risks.

10.5 Incident response readiness
- Status: [TODO] | Owner: ___ | Target: ___
- Runbook: feature flag kill-switch, login disable toggle, banner for incidents.
- Tabletop exercise quarterly.

--------------------------------------------------------------------------------

11) Concrete Drop-in Changes (Summary)

- [WIP] Register Security HTTP Interceptor (3.3).
- [WIP] Provide GlobalErrorHandler with PII redaction (4.1).
- [WIP] Route guard for User Management and sensitive routes (1.3).
- [WIP] Dev CSP meta; Prod CSP headers at edge (2.1).
- [WIP] Self-host Font Awesome; remove CDNs (2.3).
- [TODO] Idle timeout service and step-up prompts (1.2).
- [TODO] Service worker no-cache policy for /api (6.1).
- [TODO] CI: npm ci, npm audit, SBOM generation (7.1, 7.2).
- [TODO] Logging policy and console scrubbing in prod (4.2).

--------------------------------------------------------------------------------

Appendix A: Example registrations

A.1 Provide interceptor and error handler
```typescript
// filepath: /Users/dhamodharabalaji/Desktop/Workspace/Github/NgNextStarter/src/app/app.config.ts
// ...existing code...
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { securityInterceptor } from './core/interceptors/security.interceptor';
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './core/errors/global-error.handler';

export const appConfig = {
  providers: [
    // ...existing code...
    provideHttpClient(withInterceptors([securityInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
```

A.2 Role guard
```typescript
// filepath: /Users/dhamodharabalaji/Desktop/Workspace/Github/NgNextStarter/src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (roles: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.hasAnyRole(roles as any)) return true;
  router.navigate(['/unauthorized']);
  return false;
};
```

--------------------------------------------------------------------------------

Appendix B: Local validation commands (macOS)

- Install dependencies deterministically:
  - npm ci
- Security audit:
  - npm audit --audit-level=high
- SBOM:
  - npx @cyclonedx/cyclonedx-npm --output-format json --output-file sbom.json
- Lint and build:
  - ng lint
  - ng build --configuration production
- Lighthouse (basic checks):
  - npx lighthouse http://localhost:4200 --only-categories=performance,accessibility,best-practices,seo

--------------------------------------------------------------------------------

Notes
- Server must enforce all security decisions; the frontend provides defense-in-depth and safe UX.
- Keep third-party scripts to a strict allowlist with risk review. Prefer none by default.
- Reassess CSP when adding any new asset or vendor.
