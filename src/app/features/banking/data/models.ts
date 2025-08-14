export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'loan';
  maskedNumber: string;
  currency: string;
  balance: number;
  available: number;
  lastUpdated: string; // ISO
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string; // ISO
  description: string;
  category?: string;
  amount: number;
  currency: string;
  direction: 'debit' | 'credit';
  status: 'pending' | 'posted' | 'failed';
  balanceAfter?: number;
  reference?: string;
}

export interface BalanceSummary {
  accountId: string;
  asOf: string; // ISO
  current: number;
  available: number;
  holds?: number;
}

export interface TransactionFilter {
  dateFrom?: string; // ISO
  dateTo?: string; // ISO
  type?: 'debit' | 'credit';
  status?: 'pending' | 'posted' | 'failed';
  minAmount?: number;
  maxAmount?: number;
}

export interface PageRequest { page: number; pageSize: number; }
export interface PageResponse<T> { items: T[]; total: number; page: number; pageSize: number; }
