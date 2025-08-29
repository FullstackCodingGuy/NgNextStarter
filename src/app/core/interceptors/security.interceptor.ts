import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError } from 'rxjs';
import { X_REQUEST_ID } from '../constants/headers';
import { environment } from '../../../environments/environment';

function randomId() {
  // Try to use Web Crypto where available, otherwise fall back to a
  // timestamp + random suffix. This makes the function safe for SSR/test envs
  // where `crypto.getRandomValues` may be unavailable.
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
  } catch {
    // ignore and fallback
  }
  // Fallback: timestamp + random hex
  return `${Date.now().toString(16)}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
}

export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationId = randomId();
  // Optionally sanitize request body according to environment config
  let body = req.body;
  const sanitizerCfg = environment.sanitizer || { enabled: false, whitelist: [], blacklist: [] };
  if (sanitizerCfg.enabled && body && typeof body === 'object') {
    const whitelist: string[] = sanitizerCfg.whitelist || [];
    const blacklist: string[] = sanitizerCfg.blacklist || [];

    function shouldSanitizeKey(key: string): boolean {
      if (blacklist.includes(key)) return false;
      if (whitelist.length === 0) return true; // sanitize all (except blacklist)
      return whitelist.includes(key);
    }

    const sanitizeValue = (val: any, key?: string): any => {
      if (typeof val === 'string') {
        if (key && !shouldSanitizeKey(key)) return val;
        return val
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }
      if (Array.isArray(val)) return val.map(v => sanitizeValue(v));
      if (val && typeof val === 'object') {
        const out: any = {};
        for (const k in val) {
          if (Object.prototype.hasOwnProperty.call(val, k)) {
            out[k] = sanitizeValue(val[k], k);
          }
        }
        return out;
      }
      return val;
    };

    body = sanitizeValue(body);
  }

  const secureReq = req.clone({
    withCredentials: true,
    setHeaders: { [X_REQUEST_ID]: correlationId },
    body
  });

  return next(secureReq).pipe(
    retry(req.method === 'GET' ? 2 : 0),
    catchError((err: HttpErrorResponse) => {
      const safeMessage = err.status === 0
        ? 'Network error. Please try again.'
        : 'Request failed. Please contact support if this persists.';
      // Preserve the original HttpErrorResponse instance so callers keep type checks.
      try {
        (err as any).safeMessage = safeMessage;
        (err as any).correlationId = correlationId;
      } catch {
        // If mutation fails for any reason, fall back to throwing a plain object.
        return throwError(() => ({ ...err, safeMessage, correlationId }));
      }
      return throwError(() => err);
    })
  );
};
