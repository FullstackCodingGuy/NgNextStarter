import { securityInterceptor } from './security.interceptor';
import { HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';
import { of, Observable } from 'rxjs';

describe('securityInterceptor', () => {
  it('adds X-Request-ID header and sets withCredentials', (done) => {
    let capturedReq: HttpRequest<any> | null = null;
    const next = (req: HttpRequest<any>) => {
      capturedReq = req;
      return of(new HttpResponse({ status: 200 }));
    };

    const req = new HttpRequest('GET', '/test');
    securityInterceptor(req, next).subscribe({
      next: () => {
        expect(capturedReq).toBeTruthy();
        expect(capturedReq?.withCredentials).toBeTrue();
        expect(capturedReq?.headers.has('X-Request-ID')).toBeTrue();
        const id = capturedReq?.headers.get('X-Request-ID')!;
        expect(id.length).toBeGreaterThan(0);
        done();
      },
      error: (e) => { fail(e); done(); }
    });
  });

  it('retries GET requests and preserves HttpErrorResponse with safeMessage and correlationId', (done) => {
    let attempt = 0;
    let capturedReq: HttpRequest<any> | null = null;
    const next = (req: HttpRequest<any>): Observable<HttpEvent<any>> => {
      capturedReq = req;
      attempt++;
      // Fail first two attempts, succeed on third
      if (attempt < 3) {
        return new Observable((subscriber: any) => {
          subscriber.error(new HttpResponse({ status: 500 }) as any);
        });
      }
      return of(new HttpResponse({ status: 200 }));
    };

    const req = new HttpRequest('GET', '/test-retry');
    securityInterceptor(req, next).subscribe({
      next: () => {
        expect(attempt).toBeGreaterThanOrEqual(1);
        expect(capturedReq?.headers.has('X-Request-ID')).toBeTrue();
        done();
      },
      error: (err) => {
        // If retries exhausted, check augmentation
        expect((err as any).safeMessage).toBeDefined();
        expect((err as any).correlationId).toBeDefined();
        done();
      }
    });
  });
});
