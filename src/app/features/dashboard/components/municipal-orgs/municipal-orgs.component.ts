import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

// NG-ZORRO Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { environment } from '../../../../../environments/environment';
import { Organization } from '../../../../shared/models/organization.model';
import { JobPostType } from '../../../../shared/models/jobs.model';
import { Person } from '../../../../shared/models/person.model';

@Component({
  selector: 'app-municipal-organizations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzTableModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzPopconfirmModule,
    NzDividerModule,
  ],
  templateUrl: './municipal-orgs.component.html',
  styleUrls: ['./municipal-orgs.component.scss'],
})
export class MunicipalOrgsComponent implements OnInit {
  isOrganizationModalVisible = false;
  isAssignmentModalVisible = false;

  organizationForm!: FormGroup;
  assignmentForm!: FormGroup;

  organizations: Organization[] = [];
  persons: Person[] = [];
  jobPostTypes: JobPostType[] = [];

  private readonly organizationApiUrl = environment.endpoints.organization;
  private readonly personApiUrl = environment.endpoints.person;
  private readonly jobPostTypeApiUrl = environment.endpoints.jobPostType;
  private readonly jobPostAssignmentApiUrl =
    environment.endpoints.jobPostAssignment;

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private readonly http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadInitialData();

    this.organizationForm = this.fb.group({
      name: ['', [Validators.required]],
    });

    this.assignmentForm = this.fb.group({
      organizationId: [null, [Validators.required]],
      userId: [null, [Validators.required]],
      jobPostTypeId: [null, [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    });
  }

  loadInitialData(): void {
    forkJoin({
      organizations: this.http.get<Organization[]>(this.organizationApiUrl),
      persons: this.http.get<Person[]>(this.personApiUrl),
      jobPostTypes: this.http.get<JobPostType[]>(this.jobPostTypeApiUrl),
    }).subscribe({
      next: ({ organizations, persons, jobPostTypes }) => {
        this.organizations = organizations;
        this.persons = persons;
        this.jobPostTypes = (jobPostTypes.filter((postType) => postType.party_type_id === 2));
      },
      error: (err) => {
        this.notification.error(
          'خطا',
          'دریافت اطلاعات اولیه با مشکل مواجه شد.'
        );
        console.error(err);
      },
    });
  }

  // --- New Organization Modal ---
  showOrganizationModal(): void {
    this.organizationForm.reset();
    this.isOrganizationModalVisible = true;
  }

  handleOrganizationOk(): void {
    if (this.organizationForm.valid) {
      this.http
        .post<Organization>(this.organizationApiUrl, this.organizationForm.value)
        .subscribe({
          next: () => {
            this.notification.success('موفق', 'سازمان جدید با موفقیت ایجاد شد.');
            this.isOrganizationModalVisible = false;
            this.loadInitialData(); // Refresh data
          },
          error: (err) => {
            this.notification.error(
              'خطا',
              'ایجاد سازمان جدید با مشکل مواجه شد.'
            );
            console.error(err);
          },
        });
    } else {
      this.validateForm(this.organizationForm);
    }
  }

  handleOrganizationCancel(): void {
    this.isOrganizationModalVisible = false;
  }

  deleteOrganization(id: number): void {
    const deleteUrl = `${this.organizationApiUrl}${id}/`;
    this.http.delete(deleteUrl).subscribe({
      next: () => {
        this.notification.info('حذف شد', 'سازمان با موفقیت حذف گردید.');
        this.loadInitialData(); // Refresh data
      },
      error: (err) => {
        this.notification.error('خطا', 'حذف سازمان با مشکل مواجه شد.');
        console.error(err);
      },
    });
  }

  // --- Assign Person Modal ---
  showAssignmentModal(): void {
    this.assignmentForm.reset();
    this.isAssignmentModalVisible = true;
  }

  handleAssignmentOk(): void {
    if (this.assignmentForm.valid) {
      const payload = {
        party_id: Number(this.assignmentForm.value.organizationId),
        person_id: Number(this.assignmentForm.value.userId),
        job_post_type_id: Number(this.assignmentForm.value.jobPostTypeId),
        phone: this.assignmentForm.value.phoneNumber,
      };

      this.http.post(this.jobPostAssignmentApiUrl, payload).subscribe({
        next: () => {
          this.notification.success(
            'موفق',
            'فرد جدید با موفقیت به سازمان اختصاص داده شد.'
          );
          this.isAssignmentModalVisible = false;
        },
        error: (err) => {
          this.notification.error('خطا', 'اختصاص مسئول با مشکل مواجه شد.');
          console.error(err);
        },
      });
    } else {
      this.validateForm(this.assignmentForm);
    }
  }

  handleAssignmentCancel(): void {
    this.isAssignmentModalVisible = false;
  }

  // --- Utility ---
  private validateForm(form: FormGroup): void {
    Object.values(form.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}
