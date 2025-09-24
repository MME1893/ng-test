import { inject, Injectable } from '@angular/core';
import { CreateJobPostAssignmentDto, JobPostAssignment, JobPostType } from '../../models/jobs.model';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class JobPostService {
  private http = inject(HttpClient);

  private readonly jobPostApi = environment.endpoints.jobPost;

  fetchJobPostTypes(): Observable<JobPostType[]> {
    return this.http.get<JobPostType[]>(this.jobPostApi.type);
  }

  fetchJobPostAssignments(): Observable<JobPostAssignment[]> {
    return this.http.get<JobPostAssignment[]>(this.jobPostApi.assignment);
  }

  createJobPostAssignment(payload: CreateJobPostAssignmentDto): Observable<JobPostAssignment> {
    return this.http.post<JobPostAssignment>(this.jobPostApi.assignment, payload);
  }
}
