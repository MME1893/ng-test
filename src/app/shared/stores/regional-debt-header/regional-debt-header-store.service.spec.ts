import { TestBed } from '@angular/core/testing';

import { RegionalDebtHeaderStore } from './regional-debt-header-store.service';

describe('RegionalDebtHeaderStore', () => {
  let service: RegionalDebtHeaderStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegionalDebtHeaderStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
