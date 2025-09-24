import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { switchMap, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { JobPostService } from '../../services/job-post/job-post.service';
import { CreateJobPostAssignmentDto, JobPostState } from '../../models/jobs.model';

const initialState: JobPostState = {
  jobPostTypes: [],
  jobPostAssignments: [],
  isLoading: false,
  error: undefined,
};

@Injectable({
  providedIn: 'root'
})
export class JobPostStore extends ComponentStore<JobPostState> {
  private readonly _result$ = new Subject<{ action: 'create_assignment' | 'fetch_types' | 'fetch_assignments', result: 'success' | 'fail' }>();
  public readonly result$ = this._result$.asObservable();

  constructor(private readonly jobPostService: JobPostService) {
    super(initialState);
    this.fetchJobPostTypes();
    this.fetchJobPostAssignments();
  }

  public readonly vm = this.selectSignal(s => s);

  public readonly municipalJobPostTypes = this.selectSignal(
    this.vm,
    (vm) => vm.jobPostTypes.filter((postType) => postType.party_type_id === 1)
  );

  private setLoading = this.updater((state) => ({ ...state, isLoading: true, error: undefined }));
  private setError = this.updater((state, error: string) => ({ ...state, isLoading: false, error }));

  readonly fetchJobPostTypes = this.effect<void>(trigger$ =>
    trigger$.pipe(
      tap(() => this.setLoading()),
      switchMap(() =>
        this.jobPostService.fetchJobPostTypes().pipe(
          tapResponse({
            next: (jobPostTypes) => {
              this.patchState({ jobPostTypes, isLoading: false });
              this._result$.next({ action: 'fetch_types', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to load job post types');
              this._result$.next({ action: 'fetch_types', result: 'fail' });
            }
          })
        )
      )
    )
  );

  readonly fetchJobPostAssignments = this.effect<void>(trigger$ =>
    trigger$.pipe(
      tap(() => this.setLoading()),
      switchMap(() =>
        this.jobPostService.fetchJobPostAssignments().pipe(
          tapResponse({
            next: (jobPostAssignments) => {
              this.patchState({ jobPostAssignments, isLoading: false });
              this._result$.next({ action: 'fetch_assignments', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to load job post assignments');
              this._result$.next({ action: 'fetch_assignments', result: 'fail' });
            }
          })
        )
      )
    )
  );

  readonly createJobPostAssignment = this.effect<CreateJobPostAssignmentDto>(assignment$ =>
    assignment$.pipe(
      switchMap(assignment =>
        this.jobPostService.createJobPostAssignment(assignment).pipe(
          tapResponse({
            next: () => {
              this.fetchJobPostAssignments();
              this._result$.next({ action: 'create_assignment', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to create assignment');
              this._result$.next({ action: 'create_assignment', result: 'fail' });
            }
          })
        )
      )
    )
  );
}
