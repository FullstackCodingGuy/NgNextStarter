# TODO: Improvements & Coding Standards

Generated: 2025-08-29

Purpose: single source of truth for the prioritized improvements and coding-standards work for the repository. Each item includes a status and a short "latest progress" note to help future contributors pick up work quickly.

---

## How to use
- Update the `Status` when you start/complete work.
- Add `Assignee` and `PR` fields when creating pull requests.
- Keep `Latest progress` short and actionable.

---

## Priority: High (Security / correctness)

1. Move token storage off `localStorage` -> server HttpOnly cookies
   - Status: Not started
   - Assignee: TBD
   - PR: TBD
   - Latest progress: Analysis complete; `AuthService` currently stores access & refresh tokens and a client-side encrypted user mirror. Recommend BFF or cookie-based sessions.

2. Remove client-side setting of response security headers (they belong on server)
   - Status: Not started
   - Assignee: TBD
   - PR: TBD
   - Latest progress: Identified `AuthInterceptor` sets `X-Frame-Options`, `X-Content-Type-Options`. Mark for removal and add TODO comment referencing server config.

3. Replace naive request-body sanitization with a safer approach
    - Status: In progress
    - Assignee: TBD (recommended: frontend-security or platform-owner)
    - PR: TBD
    - Latest progress: Replaced fragile regex-based sanitization in `SecurityInterceptor` with conservative HTML-escaping for request-body string fields (escape &, <, >, ", '). Added guidance to use server-side validation and DOMPurify for any HTML rendered into the DOM.
    - Remaining subtasks:
       1. Preserve original `HttpErrorResponse` on error augmentation (done)
       2. Add/extend unit tests to cover retry behavior and error augmentation (done)
       3. Decide on sanitizer policy (whitelist vs blanket) and document in `docs/SANITIZATION_POLICY.md` (pending)
       4. Implement optional whitelist/field-config to avoid mutating binary/blob fields (pending)
       5. Add performance safeguards for very large payloads (pending)
       6. Coordinate with backend to avoid double-escaping and establish server policy (pending)
    - Next recommended actions (short-term):
       - Create `docs/SANITIZATION_POLICY.md` and finalize which fields should be sanitized by the client.
       - Move sanitizer whitelist into runtime-config (environment / global state) and make it opt-in.
       - Run full test suite and CI to confirm behavior across environments.

4. Implement token refresh / retry flow in interceptor
   - Status: Not started
   - Assignee: TBD
   - PR: TBD
   - Latest progress: Current interceptors call `logout()` on 401. Recommend queueing requests and performing refresh token exchange before forcing logout.

---

## Priority: Medium (Robustness / correctness)

5. Guard `window` / `document` usage for SSR compatibility
   - Status: In progress
   - Assignee: TBD
   - PR: TBD
   - Latest progress: `GlobalStateService` uses `window.matchMedia` and `document` operations; flagged. Add platform checks (isPlatformBrowser) or guard code paths.

6. Remove or gracefully degrade WebCrypto-dependent flows
   - Status: Not started
   - Assignee: TBD
   - PR: TBD
   - Latest progress: `AuthService` uses Web Crypto to encrypt a local mirror of the user. This is not reliable for security; mark as UX-only and fail-safe if crypto unavailable.

7. Add a BFF/mock server integration toggle
   - Status: Not started
   - Assignee: TBD
   - PR: TBD
   - Latest progress: Many services use in-memory mocks. Provide a clear environment flag and optional local BFF mock to enable integration testing.

---

## Priority: Low (Developer experience / hygiene)

8. Add `lint` and `format` npm scripts
   - Status: Not started
   - Assignee: TBD
   - PR: TBD
   - Latest progress: README references formatting and linting, but `package.json` lacks `lint`/`format` scripts. Add standard scripts for ESLint & Prettier.

9. Add Husky + lint-staged + commitlint
   - Status: Not started
   - Assignee: TBD
   - PR: TBD
   - Latest progress: Recommended to enforce formatting and conventional commits on push.

10. Add CI workflow (GitHub Actions) that runs lint/build/test
    - Status: Not started
    - Assignee: TBD
    - PR: TBD
    - Latest progress: Suggested CI steps: `npm ci`, `npm run lint`, `ng build --configuration=development`, `npm test`.

11. Add bundle analysis step for production builds
    - Status: Not started
    - Assignee: TBD
    - PR: TBD
    - Latest progress: Use `ng build --stats-json` + `webpack-bundle-analyzer` or similar.

---

## Coding standards checklist (short)

- TypeScript: keep `strict: true`; explicit public function return types; prefer readonly where appropriate.
- Angular: prefer standalone components and OnPush for presentational components.
- RxJS: avoid nested subscribes; unsubscribe on destroy (`takeUntil` or `async` pipe); use `switchMap`, `exhaustMap`, `concatMap` correctly.
- Security: never store secrets in `environment.*` or client repo; prefer HttpOnly cookies for tokens; server-side validation for all input.
- Linting: ESLint + `@typescript-eslint` + `@angular-eslint`; Prettier for formatting.
- Tests: unit tests for guards/interceptors/services (happy path + edge case); at least one e2e smoke test for login + route access.
- Commits: follow Conventional Commits; enforce with `commitlint`.

---

## Suggested PRs to create (small & safe)

- PR-1: Add `TODO_IMPROVEMENTS.md` (this file) and a short CONTRIBUTING note linking it.
- PR-2: Remove response-security-headers from `AuthInterceptor` and add a comment `// TODO: configure server security headers`.
- PR-3: Add `lint` and `format` scripts plus `.prettierrc`.

---

## Notes and references
- Core files reviewed (initial scan): `package.json`, `angular.json`, `tsconfig.json`, `src/main.ts`, `src/app/app.ts`, `src/app/core/services/*`, `src/app/core/guards/*`, `src/app/core/interceptors/*`.
- For security refactor, coordinate with backend/BFF owner. Client-only changes are not sufficient without server support for HttpOnly cookies and security headers.

---

If you want, I can now create the small PRs listed under "Suggested PRs to create" (PR-2 and PR-3) and run lint/build/tests locally to verify. Tell me which PR(s) to start with.
