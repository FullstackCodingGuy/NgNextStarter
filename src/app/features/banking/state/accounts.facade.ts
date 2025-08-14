import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, switchMap, tap, catchError, of } from 'rxjs';
import { BANKING_GATEWAY, BankingGateway } from '../data/tokens';
import { BankAccount, PageRequest, PageResponse } from '../data/models';

@Injectable({ providedIn: 'any' })
export class AccountsFacade {
  private readonly page$ = new BehaviorSubject<PageRequest>({ page: 1, pageSize: 10 });
  private readonly loading$ = new BehaviorSubject<boolean>(false);
  private readonly error$ = new BehaviorSubject<string | null>(null);
  private readonly list$ = new BehaviorSubject<PageResponse<BankAccount>>({ items: [], total: 0, page: 1, pageSize: 10 });

  readonly accounts$ = this.list$.asObservable();
  readonly loadingState$ = this.loading$.asObservable();
  readonly errorState$ = this.error$.asObservable();

  constructor(@Inject(BANKING_GATEWAY) private gateway: BankingGateway) {
    this.page$
      .pipe(
        tap(() => this.loading$.next(true)),
        switchMap(page => this.gateway.getAccounts(page)),
        tap(() => this.loading$.next(false)),
        catchError(() => {
          this.error$.next('Failed to load accounts');
          this.loading$.next(false);
          return of({ items: [], total: 0, page: 1, pageSize: 10 });
        })
      )
      .subscribe(res => this.list$.next(res));
  }

  load(page: PageRequest = { page: 1, pageSize: 10 }): void {
    this.page$.next(page);
  }
}
