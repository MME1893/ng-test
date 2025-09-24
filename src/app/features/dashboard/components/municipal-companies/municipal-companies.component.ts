import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// NG-ZORRO Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Company } from '../../../../shared/models/company.model';
import { Person } from '../../../../shared/models/person.model';
import { JobPostType } from '../../../../shared/models/jobs.model';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-municipal-companies',
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
  ],
  templateUrl: './municipal-companies.component.html',
  styleUrl: './municipal-companies.component.scss'
})
export class MunicipalCompaniesComponent {
  isCompanyModalVisible = false;
  isAssignmentModalVisible = false;

  companyForm!: FormGroup;
  assignmentForm!: FormGroup;

  companies: Company[] = [];
  persons: Person[] = [];
  jobPostTypes: JobPostType[] = [];

  private readonly companyApiUrl = environment.endpoints.company;
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

    this.companyForm = this.fb.group({
      name: ['', [Validators.required]],
    });

    // Form for assigning a person to a company, now includes phone number
    this.assignmentForm = this.fb.group({
      companyId: [null, [Validators.required]],
      userId: [null, [Validators.required]],
      jobPostTypeId: [null, [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    });
  }

  loadInitialData(): void {
    forkJoin({
      companies: this.http.get<Company[]>(this.companyApiUrl),
      persons: this.http.get<Person[]>(this.personApiUrl),
      jobPostTypes: this.http.get<JobPostType[]>(this.jobPostTypeApiUrl),
    }).subscribe({
      next: ({ companies, persons, jobPostTypes }) => {
        this.companies = companies;
        this.persons = persons;
        this.jobPostTypes = (jobPostTypes.filter((postType) => postType.party_type_id === 3));
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

  // --- New Company Modal ---
  showCompanyModal(): void {
    this.companyForm.reset();
    this.isCompanyModalVisible = true;
  }

  handleCompanyOk(): void {
    if (this.companyForm.valid) {
      this.http
        .post<Company>(this.companyApiUrl, this.companyForm.value)
        .subscribe({
          next: () => {
            this.notification.success('موفق', 'شرکت جدید با موفقیت ایجاد شد.');
            this.isCompanyModalVisible = false;
            this.loadInitialData(); // Refresh data
          },
          error: (err) => {
            this.notification.error('خطا', 'ایجاد شرکت جدید با مشکل مواجه شد.');
            console.error(err);
          },
        });
    } else {
      this.validateForm(this.companyForm);
    }
  }

  handleCompanyCancel(): void {
    this.isCompanyModalVisible = false;
  }

  deleteCompany(id: number): void {
    const deleteUrl = `${this.companyApiUrl}${id}/`;
    this.http.delete(deleteUrl).subscribe({
      next: () => {
        this.notification.info('حذف شد', 'شرکت با موفقیت حذف گردید.');
        this.loadInitialData(); // Refresh data
      },
      error: (err) => {
        this.notification.error('خطا', 'حذف شرکت با مشکل مواجه شد.');
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
        party_id: Number(this.assignmentForm.value.companyId),
        person_id: Number(this.assignmentForm.value.userId),
        job_post_type_id: Number(this.assignmentForm.value.jobPostTypeId),
        phone: this.assignmentForm.value.phoneNumber,
      };

      this.http.post(this.jobPostAssignmentApiUrl, payload).subscribe({
        next: () => {
          this.notification.success(
            'موفق',
            'فرد جدید با موفقیت به شرکت اختصاص داده شد.'
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
