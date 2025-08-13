export interface SecurityPosition {
  id: string;
  securityId: string;
  securityName: string;
  securityType: SecurityType;
  quantity: number;
  marketValue: number;
  bookValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  portfolioId: string;
  portfolioName: string;
  sector: string;
  country: string;
  currency: string;
  lastUpdated: Date;
}

export enum SecurityType {
  EQUITY = 'equity',
  BOND = 'bond',
  MUTUAL_FUND = 'mutual_fund',
  ETF = 'etf',
  OPTION = 'option',
  FUTURE = 'future',
  COMMODITY = 'commodity',
  CASH = 'cash'
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  managerId: string;
  managerName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSecurityPositionRequest {
  securityId: string;
  securityName: string;
  securityType: SecurityType;
  quantity: number;
  bookValue: number;
  portfolioId: string;
  sector: string;
  country: string;
  currency: string;
}

export interface UpdateSecurityPositionRequest {
  quantity?: number;
  bookValue?: number;
  portfolioId?: string;
}