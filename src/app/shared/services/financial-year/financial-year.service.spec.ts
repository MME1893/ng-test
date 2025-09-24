import { TestBed } from '@angular/core/testing';

import { FinancialYearService } from './financial-year.service';

describe('FinancialYearService', () => {
  let service: FinancialYearService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialYearService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
