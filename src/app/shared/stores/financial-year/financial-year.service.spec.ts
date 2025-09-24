import { TestBed } from '@angular/core/testing';

import { FinancialYear } from './financial-year.service';

describe('FinancialYear', () => {
  let service: FinancialYear;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialYear);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
