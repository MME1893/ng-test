import { TestBed } from '@angular/core/testing';

import { RegionStore } from './region-store.service';

describe('RegionStore', () => {
  let service: RegionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegionStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
