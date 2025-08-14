import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, switchMap, tap, catchError, of, combineLatest } from 'rxjs';
import { BANKING_GATEWAY, BankingGateway } from '../data/tokens';
import { PageRequest, PageResponse, Transaction, TransactionFilter } from '../data/models';

@Injectable({ providedIn: 'any' })
export class TransactionsFacade {
  private readonly page$ = new BehaviorSubject<PageRequest>({ page: 1, pageSize: 10 });
  private readonly filters$ = new BehaviorSubject<TransactionFilter>({});
  private readonly loading$ = new BehaviorSubject<boolean>(false);
  private readonly error$ = new BehaviorSubject<string | null>(null);
  private readonly list$ = new BehaviorSubject<PageResponse<Transaction>>({ items: [], total: 0, page: 1, pageSize: 10 });

  readonly transactions$ = this.list$.asObservable();
  readonly loadingState$ = this.loading$.asObservable();
  readonly errorState$ = this.error$.asObservable();
  readonly filtersState$ = this.filters$.asObservable();

  constructor(@Inject(BANKING_GATEWAY) private gateway: BankingGateway) {
    combineLatest([this.page$, this.filters$])
      .pipe(
        tap(() => this.loading$.next(true)),
        switchMap(([page, filter]) => this.gateway.getTransactions(page, filter)),
        tap(() => this.loading$.next(false)),
        catchError(() => {
          this.error$.next('Failed to load transactions');
          this.loading$.next(false);
          return of({ items: [], total: 0, page: 1, pageSize: 10 });
        })
      )
      .subscribe(res => this.list$.next(res));
  }

  load(page: PageRequest = { page: 1, pageSize: 10 }): void { this.page$.next(page); }
  setFilters(filter: TransactionFilter): void { this.filters$.next(filter); }
}
