import { TestBed } from '@angular/core/testing';

import { DashboardMenuService } from './dashboard-menu.service';

describe('DashboardMenuService', () => {
  let service: DashboardMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
