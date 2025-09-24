import { Component, input, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// NG-ZORRO Modules
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Region } from '../../../../../../shared/models/region.model';
import { Organization } from '../../../../../../shared/models/organization.model';
import { RegionStore } from '../../../../../../shared/stores/region/region-store.service';
import { catchError, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';

export interface ContributionPayload {
  contribution_id: number;
  party_id: number;
  percentage?: number;
  amount?: number;
}


@Component({
  selector: 'app-create-share-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzInputNumberModule,
    NzButtonModule,
  ],
  templateUrl: './create-share-modal.component.html',
  styleUrl: './create-share-modal.component.scss'
})
export class CreateShareModalComponent {
  contributionId = input.required<number>();
  isPercentage = input.required<boolean>();
  isRegion = input.required<boolean>();
  public readonly regionVm;
  private readonly contributionDetailApi = environment.endpoints.contributionDetail;


  // --- Outputs to Parent ---
  onClose = output<void>();
  onSubmit = output<ContributionPayload>();

  form!: FormGroup;

  // Mock data as placeholders - you will replace these with your actual data
  regions: Region[] = [
    { id: 101, name: 'منطقه ۱' },
    { id: 102, name: 'منطقه ۲' },
  ];
  organizations: Organization[] = [
  ];

  constructor(
    private fb: FormBuilder,
    private readonly regionStore: RegionStore,
    private readonly http: HttpClient,
    private readonly notification: NzNotificationService) {
    this.regionVm = this.regionStore.vm;
  }

  loadOrganizations(): void {
    const organizationApi = environment.endpoints.organization;
    this.http.get<Organization[]>(organizationApi).pipe(
      tap((res) => { this.organizations = res }),
      catchError(error => {
        console.error('Error fetching organizations:', error);
        return of([]);
      })
    ).subscribe();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      party_id: [null, [Validators.required]],
      amount: [null],
      percentage: [null],
    });

    this.loadOrganizations();
    if (this.isPercentage()) {
      this.form.get('percentage')?.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]);
    } else {
      this.form.get('amount')?.setValidators([
        Validators.required,
        Validators.min(0)
      ]);
    }
  }

  handleOk(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const formValue = this.form.value;

    let payload: ContributionPayload = {
      contribution_id: this.contributionId(),
      party_id: formValue.party_id,
    };
    payload = this.isPercentage()
      ? { ...payload, percentage: formValue.percentage }
      : { ...payload, amount: formValue.amount };

    // Make the HTTP POST request
    this.http.post(this.contributionDetailApi, payload).subscribe({
      next: () => {
        this.notification.success('موفق', 'سهم جدید با موفقیت ذخیره شد.');
        this.onClose.emit();   // Close the modal
      },
      error: (err) => {
        const errorMessage = err?.error?.detail || 'خطا در ثبت اطلاعات. لطفا دوباره تلاش کنید.';
        this.notification.error('خطا', errorMessage);
        console.error('API Submission Error:', err);
      }
    });
  }

  handleCancel(): void {
    this.onClose.emit();
  }
}
