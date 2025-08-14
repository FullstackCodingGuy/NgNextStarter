import { TestBed } from '@angular/core/testing';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { BANKING_GATEWAY } from './data/tokens';
import { MockBankingGateway } from './data/banking.mock';
import { AccountsFacade } from './state/accounts.facade';

describe('BankingModule wiring', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([], withDisabledInitialNavigation()),
        { provide: BANKING_GATEWAY, useClass: MockBankingGateway },
        AccountsFacade
      ]
    });
  });

  it('should resolve AccountsFacade and load accounts', (done) => {
    const facade = TestBed.inject(AccountsFacade);
    facade.accounts$.subscribe(v => {
      if (v.items.length) {
        expect(v.total).toBeGreaterThan(0);
        done();
      }
    });
    facade.load();
  });
});
