import { TestBed } from '@angular/core/testing';

import { OweTypeStoreService } from './owe-type-store.service';

describe('OweTypeStoreService', () => {
  let service: OweTypeStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OweTypeStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
