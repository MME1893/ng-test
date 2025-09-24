export interface JobPostType {
    id: number;
    name: string;
    party_type_id: number;
}

export interface JobPostAssignment {
    id: number;
    party_id: number;
    phone: string;
    person_id: number;
    job_post_type_id: number;
}

export type CreateJobPostAssignmentDto = Omit<JobPostAssignment, 'id'>;

export interface JobPostState {
    jobPostTypes: JobPostType[];
    jobPostAssignments: JobPostAssignment[];
    isLoading: boolean;
    error?: string;
}