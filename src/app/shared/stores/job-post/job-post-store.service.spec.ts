import { TestBed } from '@angular/core/testing';

import { JobPostStore } from './job-post-store.service';

describe('JobPostStore', () => {
  let service: JobPostStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobPostStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
