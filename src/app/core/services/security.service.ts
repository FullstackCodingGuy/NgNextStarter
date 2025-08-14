import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { SecurityPosition, Portfolio, CreateSecurityPositionRequest, UpdateSecurityPositionRequest, SecurityType } from '../models/security.model';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/common.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly API_URL = `${environment.apiUrl}/securities`;
  
  // Mock data for demonstration
  private mockPositions: SecurityPosition[] = [
    {
      id: '1',
      securityId: 'AAPL',
      securityName: 'Apple Inc.',
      securityType: SecurityType.EQUITY,
      quantity: 100,
      marketValue: 17500,
      bookValue: 15000,
      gainLoss: 2500,
      gainLossPercentage: 16.67,
      portfolioId: 'portfolio-1',
      portfolioName: 'Growth Portfolio',
      sector: 'Technology',
      country: 'United States',
      currency: 'USD',
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: '2',
      securityId: 'GOOGL',
      securityName: 'Alphabet Inc.',
      securityType: SecurityType.EQUITY,
      quantity: 50,
      marketValue: 13750,
      bookValue: 12000,
      gainLoss: 1750,
      gainLossPercentage: 14.58,
      portfolioId: 'portfolio-1',
      portfolioName: 'Growth Portfolio',
      sector: 'Technology',
      country: 'United States',
      currency: 'USD',
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: '3',
      securityId: 'MSFT',
      securityName: 'Microsoft Corporation',
      securityType: SecurityType.EQUITY,
      quantity: 75,
      marketValue: 28125,
      bookValue: 26250,
      gainLoss: 1875,
      gainLossPercentage: 7.14,
      portfolioId: 'portfolio-2',
      portfolioName: 'Balanced Portfolio',
      sector: 'Technology',
      country: 'United States',
      currency: 'USD',
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: '4',
      securityId: 'SPY',
      securityName: 'SPDR S&P 500 ETF Trust',
      securityType: SecurityType.ETF,
      quantity: 200,
      marketValue: 95000,
      bookValue: 88000,
      gainLoss: 7000,
      gainLossPercentage: 7.95,
      portfolioId: 'portfolio-2',
      portfolioName: 'Balanced Portfolio',
      sector: 'Diversified',
      country: 'United States',
      currency: 'USD',
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: '5',
      securityId: 'BND',
      securityName: 'Vanguard Total Bond Market ETF',
      securityType: SecurityType.ETF,
      quantity: 300,
      marketValue: 22500,
      bookValue: 24000,
      gainLoss: -1500,
      gainLossPercentage: -6.25,
      portfolioId: 'portfolio-3',
      portfolioName: 'Conservative Portfolio',
      sector: 'Fixed Income',
      country: 'United States',
      currency: 'USD',
      lastUpdated: new Date('2024-01-15')
    }
  ];

  private mockPortfolios: Portfolio[] = [
    {
      id: 'portfolio-1',
      name: 'Growth Portfolio',
      description: 'High-growth technology focused portfolio',
      totalValue: 31250,
      totalGainLoss: 4250,
      totalGainLossPercentage: 15.73,
      managerId: '1',
      managerName: 'John Smith',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'portfolio-2',
      name: 'Balanced Portfolio',
      description: 'Diversified portfolio with mixed assets',
      totalValue: 123125,
      totalGainLoss: 8875,
      totalGainLossPercentage: 7.77,
      managerId: '2',
      managerName: 'Sarah Johnson',
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'portfolio-3',
      name: 'Conservative Portfolio',
      description: 'Low-risk fixed income focused portfolio',
      totalValue: 22500,
      totalGainLoss: -1500,
      totalGainLossPercentage: -6.25,
      managerId: '3',
      managerName: 'Mike Davis',
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2024-01-15')
    }
  ];

  constructor(private http: HttpClient) {}

  getSecurityPositions(params: PaginationParams): Observable<PaginatedResponse<SecurityPosition>> {
    // Mock implementation with filtering and sorting
    return of(this.mockPositions).pipe(
      delay(500),
      map(positions => {
        let filteredPositions = [...positions];

        // Apply filters
        if (params.filters) {
          params.filters.forEach(filter => {
            filteredPositions = filteredPositions.filter(position => {
              const value = (position as any)[filter.field];
              switch (filter.operator) {
                case 'contains':
                  return value?.toString().toLowerCase().includes(filter.value.toLowerCase());
                case 'eq':
                  return value === filter.value;
                case 'gt':
                  return value > filter.value;
                case 'gte':
                  return value >= filter.value;
                case 'lt':
                  return value < filter.value;
                case 'lte':
                  return value <= filter.value;
                default:
                  return true;
              }
            });
          });
        }

        // Apply sorting
        if (params.sortBy) {
          filteredPositions.sort((a, b) => {
            const aValue = (a as any)[params.sortBy!];
            const bValue = (b as any)[params.sortBy!];
            const direction = params.sortDirection === 'desc' ? -1 : 1;
            
            if (aValue < bValue) return -1 * direction;
            if (aValue > bValue) return 1 * direction;
            return 0;
          });
        }

        // Apply pagination
        const startIndex = (params.pageNumber - 1) * params.pageSize;
        const endIndex = startIndex + params.pageSize;
        const paginatedItems = filteredPositions.slice(startIndex, endIndex);
        const totalCount = filteredPositions.length;
        const totalPages = Math.ceil(totalCount / params.pageSize);

        return {
          items: paginatedItems,
          totalCount,
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          totalPages,
          hasPreviousPage: params.pageNumber > 1,
          hasNextPage: params.pageNumber < totalPages
        };
      })
    );
  }

  getSecurityPosition(id: string): Observable<SecurityPosition> {
    const position = this.mockPositions.find(p => p.id === id);
    return of(position!).pipe(delay(300));
  }

  createSecurityPosition(request: CreateSecurityPositionRequest): Observable<SecurityPosition> {
    const newPosition: SecurityPosition = {
      id: Math.random().toString(36).substr(2, 9),
      securityId: request.securityId,
      securityName: request.securityName,
      securityType: request.securityType,
      quantity: request.quantity,
      marketValue: request.bookValue * 1.05, // Mock market value calculation
      bookValue: request.bookValue,
      gainLoss: request.bookValue * 0.05,
      gainLossPercentage: 5,
      portfolioId: request.portfolioId,
      portfolioName: this.mockPortfolios.find(p => p.id === request.portfolioId)?.name || '',
      sector: request.sector,
      country: request.country,
      currency: request.currency,
      lastUpdated: new Date()
    };

    this.mockPositions.push(newPosition);
    return of(newPosition).pipe(delay(500));
  }

  updateSecurityPosition(id: string, request: UpdateSecurityPositionRequest): Observable<SecurityPosition> {
    const index = this.mockPositions.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Position not found');
    }

    const position = { ...this.mockPositions[index] };
    
    if (request.quantity !== undefined) {
      position.quantity = request.quantity;
      position.marketValue = position.marketValue * (request.quantity / position.quantity);
    }
    
    if (request.bookValue !== undefined) {
      position.bookValue = request.bookValue;
      position.gainLoss = position.marketValue - request.bookValue;
      position.gainLossPercentage = (position.gainLoss / request.bookValue) * 100;
    }
    
    if (request.portfolioId !== undefined) {
      position.portfolioId = request.portfolioId;
      position.portfolioName = this.mockPortfolios.find(p => p.id === request.portfolioId)?.name || '';
    }

    position.lastUpdated = new Date();
    this.mockPositions[index] = position;
    
    return of(position).pipe(delay(500));
  }

  deleteSecurityPosition(id: string): Observable<void> {
    const index = this.mockPositions.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Position not found');
    }

    this.mockPositions.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }

  getPortfolios(): Observable<Portfolio[]> {
    return of(this.mockPortfolios).pipe(delay(300));
  }

  getSecurityTypes(): SecurityType[] {
    return Object.values(SecurityType);
  }

  getPortfolioSummary(): Observable<any> {
    const totalValue = this.mockPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
    const totalGainLoss = this.mockPositions.reduce((sum, pos) => sum + pos.gainLoss, 0);
    const totalGainLossPercentage = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

    const summary = {
      totalValue,
      totalGainLoss,
      totalGainLossPercentage,
      positionCount: this.mockPositions.length,
      portfolioCount: this.mockPortfolios.length,
      topPerformers: this.mockPositions
        .sort((a, b) => b.gainLossPercentage - a.gainLossPercentage)
        .slice(0, 5),
      sectorAllocation: this.getSectorAllocation()
    };

    return of(summary).pipe(delay(300));
  }

  private getSectorAllocation(): any {
    const sectorTotals: { [key: string]: number } = {};
    let totalValue = 0;

    this.mockPositions.forEach(position => {
      if (!sectorTotals[position.sector]) {
        sectorTotals[position.sector] = 0;
      }
      sectorTotals[position.sector] += position.marketValue;
      totalValue += position.marketValue;
    });

    return Object.keys(sectorTotals).map(sector => ({
      sector,
      value: sectorTotals[sector],
      percentage: totalValue > 0 ? (sectorTotals[sector] / totalValue) * 100 : 0
    }));
  }
}