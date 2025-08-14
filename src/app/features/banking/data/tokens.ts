import { InjectionToken } from '@angular/core';
import { PageRequest, PageResponse, BankAccount, Transaction, TransactionFilter, BalanceSummary } from './models';
import { Observable } from 'rxjs';

export interface BankingGateway {
  getAccounts(page: PageRequest): Observable<PageResponse<BankAccount>>;
  getAccount(id: string): Observable<BankAccount>;
  getTransactions(page: PageRequest, filter: TransactionFilter): Observable<PageResponse<Transaction>>;
  getTransaction(id: string): Observable<Transaction>;
  getBalances(accountId?: string): Observable<BalanceSummary[]>;
  // mutation guarded by permissions
  createTransaction?(tx: Partial<Transaction>): Observable<Transaction>;
}

export const BANKING_GATEWAY = new InjectionToken<BankingGateway>('BANKING_GATEWAY');
