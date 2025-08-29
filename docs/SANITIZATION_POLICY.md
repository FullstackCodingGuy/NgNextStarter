# Sanitization Policy

This document defines the client-side sanitization policy used by the application and the contract with backend services.

Principles
- Server-side validation and encoding is the single source of truth. The client performs lightweight, conservative escaping only as a secondary defense-in-depth measure.
- By default the client sanitizer is opt-in. Use `environment.sanitizer.enabled` and a whitelist to control which fields the client escapes.
- Never rely exclusively on client-side sanitization for security.

Client behaviour
- When `environment.sanitizer.enabled === true` and a whitelist is provided, the client will HTML-escape string values only for fields listed in `whitelist`.
- If whitelist is empty and `enabled === true`, the client will escape all string fields except those in `blacklist`.
- Escaping performed by the client replaces: `&` -> `&amp;`, `<` -> `&lt;`, `>` -> `&gt;`, `"` -> `&quot;`, `'` -> `&#39;`.

Server contract
- Backend services must document whether they expect escaped inputs for text fields. If server expects raw HTML (e.g., WYSIWYG content), client sanitizer must skip those fields.
- Server should always validate and encode output for rendering in the browser.
- Where HTML is accepted and must be rendered, the rendering layer must sanitize with a vetted library (DOMPurify) before inserting into the DOM.

Examples
- For a `comment` field that is plain text, the client may escape it before sending to the server. The server must decode/interpret it as plain text and not re-escape it when storing.

Operational Guidance
- Keep `sanitizer.enabled` = `false` in production unless you control the backend contract.
- Use the whitelist to limit surface area for client-side escaping.
- Add integration tests that verify no double-escaping occurs end-to-end.
