import { ErrorHandler, Injectable, isDevMode } from '@angular/core';

const redact = (msg: unknown) => {
  const s = typeof msg === 'string' ? msg : JSON.stringify(msg ?? {});
  return s
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[redacted-email]')
    .replace(/\b\d{12,19}\b/g, '[redacted-pan]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[redacted-ssn]');
};

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const payload = { message: redact(error), ts: Date.now() };
    // TODO: send to APM/SIEM endpoint (do not log raw error in production)
    if (isDevMode()) {
      // eslint-disable-next-line no-console
      console.error('Error:', payload);
    }
  }
}
