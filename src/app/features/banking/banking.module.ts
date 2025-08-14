import { NgModule, Provider, ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BankingRoutingModule } from './banking-routing.module';
import { BANKING_GATEWAY } from './data/tokens';
import { MockBankingGateway } from './data/banking.mock';
import { FEATURE_PERMISSIONS } from '../../core/tokens/permissions.token';

// Feature flag could be read from environment; using mock by default for now.
const providers: Provider[] = [
  { provide: BANKING_GATEWAY, useExisting: MockBankingGateway },
  { provide: FEATURE_PERMISSIONS, multi: true, useValue: ['banking.read','banking.write'] },
  // Optional initializer for future setup
  { provide: ENVIRONMENT_INITIALIZER, multi: true, useValue: () => { inject(BANKING_GATEWAY); } }
];

@NgModule({
  imports: [CommonModule, RouterModule, BankingRoutingModule],
  providers
})
export class BankingModule {}
