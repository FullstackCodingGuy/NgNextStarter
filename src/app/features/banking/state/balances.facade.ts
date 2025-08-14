import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { BANKING_GATEWAY, BankingGateway } from '../data/tokens';
import { BalanceSummary } from '../data/models';

@Injectable({ providedIn: 'any' })
export class BalancesFacade {
  private readonly loading$ = new BehaviorSubject<boolean>(false);
  private readonly error$ = new BehaviorSubject<string | null>(null);
  private readonly list$ = new BehaviorSubject<BalanceSummary[]>([]);

  readonly balances$ = this.list$.asObservable();
  readonly loadingState$ = this.loading$.asObservable();
  readonly errorState$ = this.error$.asObservable();

  constructor(@Inject(BANKING_GATEWAY) private gateway: BankingGateway) {}

  load(accountId?: string): void {
    this.loading$.next(true);
    this.gateway.getBalances(accountId)
      .pipe(tap(() => this.loading$.next(false)))
      .subscribe({
        next: res => this.list$.next(res),
        error: () => {
          this.error$.next('Failed to load balances');
          this.loading$.next(false);
        }
      });
  }
}
