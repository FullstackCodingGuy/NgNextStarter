import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { BankAccount, BalanceSummary, PageRequest, PageResponse, Transaction, TransactionFilter } from './models';
import { BankingGateway } from './tokens';

@Injectable({ providedIn: 'root' })
export class MockBankingGateway implements BankingGateway {
  private accounts: BankAccount[] = [
    { id: 'acc-1', name: 'Checking', type: 'checking', maskedNumber: '****1234', currency: 'USD', balance: 2150.32, available: 2100.32, lastUpdated: new Date().toISOString() },
    { id: 'acc-2', name: 'Savings', type: 'savings', maskedNumber: '****5678', currency: 'USD', balance: 10250.55, available: 10250.55, lastUpdated: new Date().toISOString() },
  ];

  private transactions: Transaction[] = Array.from({ length: 75 }).map((_, i) => ({
    id: 'tx-' + (i + 1),
    accountId: i % 2 === 0 ? 'acc-1' : 'acc-2',
    date: new Date(Date.now() - i * 86400000).toISOString(),
    description: i % 3 === 0 ? 'Grocery Store' : i % 3 === 1 ? 'Salary' : 'Online Purchase',
    category: i % 3 === 1 ? 'Income' : 'Expense',
    amount: i % 3 === 1 ? 2000 : Math.round((Math.random() * 120 + 10) * 100) / 100,
    currency: 'USD',
    direction: i % 3 === 1 ? 'credit' : 'debit',
    status: i % 5 === 0 ? 'pending' : 'posted',
    balanceAfter: 2000 - i * 5,
    reference: 'REF' + (10000 + i)
  }));

  getAccounts(page: PageRequest): Observable<PageResponse<BankAccount>> {
    const start = (page.page - 1) * page.pageSize;
    const end = start + page.pageSize;
    const items = this.accounts.slice(start, end);
    return of({ items, total: this.accounts.length, page: page.page, pageSize: page.pageSize }).pipe(delay(200));
  }

  getAccount(id: string): Observable<BankAccount> {
    const acc = this.accounts.find(a => a.id === id)!;
    return of(acc).pipe(delay(150));
  }

  getTransactions(page: PageRequest, filter: TransactionFilter): Observable<PageResponse<Transaction>> {
    let list = [...this.transactions];
    if (filter) {
      list = list.filter(t => {
        const withinFrom = filter.dateFrom ? new Date(t.date) >= new Date(filter.dateFrom) : true;
        const withinTo = filter.dateTo ? new Date(t.date) <= new Date(filter.dateTo) : true;
        const typeOk = filter.type ? t.direction === filter.type : true;
        const statusOk = filter.status ? t.status === filter.status : true;
        const minOk = typeof filter.minAmount === 'number' ? t.amount >= filter.minAmount! : true;
        const maxOk = typeof filter.maxAmount === 'number' ? t.amount <= filter.maxAmount! : true;
        return withinFrom && withinTo && typeOk && statusOk && minOk && maxOk;
      });
    }
    const start = (page.page - 1) * page.pageSize;
    const end = start + page.pageSize;
    const items = list.slice(start, end);
    return of({ items, total: list.length, page: page.page, pageSize: page.pageSize }).pipe(delay(250));
  }

  getTransaction(id: string): Observable<Transaction> {
    const tx = this.transactions.find(t => t.id === id)!;
    return of(tx).pipe(delay(150));
  }

  getBalances(accountId?: string): Observable<BalanceSummary[]> {
    const byAcc = (id: string): BalanceSummary => ({
      accountId: id,
      asOf: new Date().toISOString(),
      current: this.accounts.find(a => a.id === id)?.balance || 0,
      available: this.accounts.find(a => a.id === id)?.available || 0,
      holds: 0
    });
    const result = accountId ? [byAcc(accountId)] : this.accounts.map(a => byAcc(a.id));
    return of(result).pipe(delay(180));
  }

  createTransaction(tx: Partial<Transaction>): Observable<Transaction> {
    const newTx: Transaction = {
      id: 'tx-' + (this.transactions.length + 1),
      accountId: tx.accountId || 'acc-1',
      date: new Date().toISOString(),
      description: tx.description || 'Manual Entry',
      category: tx.category,
      amount: tx.amount || 0,
      currency: tx.currency || 'USD',
      direction: (tx.direction as any) || 'debit',
      status: 'posted',
      balanceAfter: 0,
      reference: 'REF' + Math.floor(Math.random() * 100000)
    };
    this.transactions.unshift(newTx);
    return of(newTx).pipe(delay(200));
  }
}
