import { TestBed } from '@angular/core/testing';

import { RegionalDebtHeaderService } from './regional-debt-header.service';

describe('RegionalDebtHeaderService', () => {
  let service: RegionalDebtHeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegionalDebtHeaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
