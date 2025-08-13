import { Component, OnInit } from '@angular/core';
import { SecurityService } from '../../../core/services/security.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {{ (currentUser$ | async)?.firstName }}!</p>
      </div>

      <div class="dashboard-grid">
        <!-- Portfolio Summary Cards -->
        <div class="summary-cards">
          <mat-card class="summary-card total-value">
            <mat-card-content>
              <div class="card-header">
                <mat-icon>account_balance_wallet</mat-icon>
                <h3>Total Portfolio Value</h3>
              </div>
              <div class="card-value">
                {{ portfolioSummary?.totalValue | currency:'USD':'symbol':'1.2-2' }}
              </div>
              <div class="card-change positive" *ngIf="portfolioSummary?.totalGainLoss > 0">
                +{{ portfolioSummary?.totalGainLoss | currency:'USD':'symbol':'1.2-2' }}
                ({{ portfolioSummary?.totalGainLossPercentage | number:'1.2-2' }}%)
              </div>
              <div class="card-change negative" *ngIf="portfolioSummary?.totalGainLoss < 0">
                {{ portfolioSummary?.totalGainLoss | currency:'USD':'symbol':'1.2-2' }}
                ({{ portfolioSummary?.totalGainLossPercentage | number:'1.2-2' }}%)
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card positions">
            <mat-card-content>
              <div class="card-header">
                <mat-icon>trending_up</mat-icon>
                <h3>Total Positions</h3>
              </div>
              <div class="card-value">{{ portfolioSummary?.positionCount }}</div>
              <div class="card-subtitle">Across {{ portfolioSummary?.portfolioCount }} portfolios</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card best-performer">
            <mat-card-content>
              <div class="card-header">
                <mat-icon>star</mat-icon>
                <h3>Best Performer</h3>
              </div>
              <div class="card-value" *ngIf="portfolioSummary?.topPerformers?.length > 0">
                {{ portfolioSummary.topPerformers[0].securityName }}
              </div>
              <div class="card-change positive" *ngIf="portfolioSummary?.topPerformers?.length > 0">
                +{{ portfolioSummary.topPerformers[0].gainLossPercentage | number:'1.2-2' }}%
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Top Performers Table -->
        <mat-card class="performance-card">
          <mat-card-header>
            <mat-card-title>Top Performing Securities</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="topPerformers" class="performance-table">
                <ng-container matColumnDef="security">
                  <th mat-header-cell *matHeaderCellDef>Security</th>
                  <td mat-cell *matCellDef="let position">
                    <div class="security-cell">
                      <strong>{{ position.securityId }}</strong>
                      <div class="security-name">{{ position.securityName }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="value">
                  <th mat-header-cell *matHeaderCellDef>Market Value</th>
                  <td mat-cell *matCellDef="let position">
                    {{ position.marketValue | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="gain">
                  <th mat-header-cell *matHeaderCellDef>Gain/Loss</th>
                  <td mat-cell *matCellDef="let position">
                    <span [class]="position.gainLoss >= 0 ? 'positive' : 'negative'">
                      {{ position.gainLoss | currency:'USD':'symbol':'1.2-2' }}
                      ({{ position.gainLossPercentage | number:'1.2-2' }}%)
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="performanceColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: performanceColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Sector Allocation Chart -->
        <mat-card class="allocation-card">
          <mat-card-header>
            <mat-card-title>Sector Allocation</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="allocation-chart">
              <div 
                class="allocation-item" 
                *ngFor="let sector of sectorAllocation">
                <div class="allocation-label">
                  <span class="sector-name">{{ sector.sector }}</span>
                  <span class="sector-percentage">{{ sector.percentage | number:'1.1-1' }}%</span>
                </div>
                <div class="allocation-bar">
                  <div 
                    class="allocation-fill" 
                    [style.width.%]="sector.percentage">
                  </div>
                </div>
                <div class="allocation-value">
                  {{ sector.value | currency:'USD':'symbol':'1.0-0' }}
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card class="actions-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <button mat-raised-button color="primary" routerLink="/securities/add">
                <mat-icon>add</mat-icon>
                Add Position
              </button>
              
              <button mat-raised-button color="accent" routerLink="/securities">
                <mat-icon>view_list</mat-icon>
                View All Positions
              </button>
              
              <button mat-raised-button routerLink="/reports">
                <mat-icon>assessment</mat-icon>
                Generate Report
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <app-loading-spinner *ngIf="isLoading" [overlay]="false" message="Loading dashboard data..."></app-loading-spinner>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
    }

    .dashboard-header {
      margin-bottom: 32px;
    }

    .dashboard-header h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 400;
    }

    .dashboard-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      grid-column: 1 / -1;
    }

    .summary-card {
      min-height: 120px;
    }

    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-header mat-icon {
      margin-right: 8px;
      color: #666;
    }

    .card-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #666;
    }

    .card-value {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .card-change {
      font-size: 14px;
      font-weight: 500;
    }

    .card-change.positive {
      color: #4caf50;
    }

    .card-change.negative {
      color: #f44336;
    }

    .card-subtitle {
      font-size: 12px;
      color: #666;
    }

    .performance-card {
      grid-column: span 2;
    }

    .table-container {
      max-height: 300px;
      overflow-y: auto;
    }

    .performance-table {
      width: 100%;
    }

    .security-cell {
      line-height: 1.4;
    }

    .security-name {
      font-size: 12px;
      color: #666;
    }

    .positive {
      color: #4caf50;
      font-weight: 500;
    }

    .negative {
      color: #f44336;
      font-weight: 500;
    }

    .allocation-chart {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .allocation-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .allocation-label {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }

    .sector-name {
      font-weight: 500;
    }

    .sector-percentage {
      color: #666;
    }

    .allocation-bar {
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .allocation-fill {
      height: 100%;
      background: linear-gradient(90deg, #3f51b5, #2196f3);
      transition: width 0.3s ease;
    }

    .allocation-value {
      font-size: 12px;
      color: #666;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .action-buttons button {
      justify-content: flex-start;
    }

    .action-buttons mat-icon {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }

      .performance-card {
        grid-column: span 1;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;
  portfolioSummary: any;
  topPerformers: any[] = [];
  sectorAllocation: any[] = [];
  isLoading = true;

  performanceColumns = ['security', 'value', 'gain'];

  constructor(
    private securityService: SecurityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    this.securityService.getPortfolioSummary().subscribe({
      next: (summary) => {
        this.portfolioSummary = summary;
        this.topPerformers = summary.topPerformers;
        this.sectorAllocation = summary.sectorAllocation;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }
}