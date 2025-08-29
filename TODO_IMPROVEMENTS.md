# TODO: Improvements & Coding Standards

Generated: 2025-08-29

Purpose: single source of truth for the prioritized improvements and coding-standards work for the repository. Each item includes a status and a short "latest progress" note to help future contributors pick up work quickly.

---

## How to use
- Update the `Status` when you start/complete work.
- Add `PR` field when creating pull requests.
- Keep `Latest progress` short and actionable.

---

## Priority: High (Security / correctness)

1. Move token storage off `localStorage` -> server HttpOnly cookies
   - Status: Not started
   - Assignee: TBD
   - PR: TBD
   - Latest progress: Analysis complete; `AuthService` currently stores access & refresh tokens and a client-side encrypted user mirror. Recommend BFF or cookie-based sessions.



2. Implement token refresh / retry flow in interceptor
   - Status: Not started
   - Assignee: TBD
   - PR: TBD
   - Latest progress: Current interceptors call `logout()` on 401. Recommend queueing requests and performing refresh token exchange before forcing logout.

---

## Priority: Medium (Robustness / correctness)



7. Add a BFF/mock server integration toggle
   - Status: Not started
   - Assignee: TBD
   - PR: TBD
   - Latest progress: Many services use in-memory mocks. Provide a clear environment flag and optional local BFF mock to enable integration testing.

---

## Priority: Low (Developer experience / hygiene)

8. Add `lint` and `format` npm scripts
   - Status: Not started
   - PR: TBD
   - Latest progress: README references formatting and linting, but `package.json` lacks `lint`/`format` scripts. Add standard scripts for ESLint & Prettier.

9. Add Husky + lint-staged + commitlint
   - Status: Not started
   - PR: TBD
   - Latest progress: Recommended to enforce formatting and conventional commits on push.

10. Add CI workflow (GitHub Actions) that runs lint/build/test
   - Status: Not started
   - PR: TBD
   - Latest progress: Suggested CI steps: `npm ci`, `npm run lint`, `ng build --configuration=development`, `npm test`.

11. Add bundle analysis step for production builds
   - Status: Not started
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
