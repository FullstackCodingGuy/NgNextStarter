import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError } from 'rxjs';

function randomId() {
  // lightweight UUID-like id without adding deps
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationId = randomId();
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
