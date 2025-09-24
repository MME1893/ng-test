import { TestBed } from '@angular/core/testing';

import { OweTypeService } from './owe-type.service';

describe('OweTypeService', () => {
  let service: OweTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OweTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
