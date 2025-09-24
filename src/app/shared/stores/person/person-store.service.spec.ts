import { TestBed } from '@angular/core/testing';

import { PersonStore } from './person-store.service';

describe('PersonStore', () => {
  let service: PersonStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
