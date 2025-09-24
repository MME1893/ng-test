import { Component, computed, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { RegionStore } from '../../../../../shared/stores/region/region-store.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { JobPostStore } from '../../../../../shared/stores/job-post/job-post-store.service';
import { PersonStore } from '../../../../../shared/stores/person/person-store.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CreateJobPostAssignmentDto } from '../../../../../shared/models/jobs.model';

@Component({
  selector: 'app-assign-person-to-region-modal',
  imports: [
    NzModalModule,
    NzInputModule,
    NzFormModule,
    ReactiveFormsModule,
    NzSelectModule
  ],
  templateUrl: './assign-person-to-region-modal.component.html',
  styleUrl: './assign-person-to-region-modal.component.scss'
})
export class AssignPersonToRegionModalComponent implements OnInit {
  onClose = output<void>();

  public assignmentForm!: FormGroup;
  public readonly regionVm;
  public readonly jobPostVm;
  public readonly personVm;
  public readonly regionPostTypes = computed(() => { return this.jobPostVm().jobPostTypes.filter(pt => pt.id === 1) })

  constructor(
    private readonly fb: FormBuilder,
    private readonly regionStore: RegionStore,
    private readonly jobPostStore: JobPostStore,
    private readonly personStore: PersonStore,
    private readonly notification: NzNotificationService,
  ) {
    this.regionVm = this.regionStore.vm;
    this.jobPostVm = this.jobPostStore.vm;
    this.personVm = this.personStore.vm;
  }

  ngOnInit(): void {
    this.assignmentForm = this.fb.group({
      party_id: [null, [Validators.required]],
      person_id: [null, [Validators.required]],
      job_post_type_id: [null, [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    });

    this.listenFroResult();
  }

  onAssign(): void {
    this.validateForm(this.assignmentForm);

    if (this.assignmentForm.invalid) return;

    const formValue = this.assignmentForm.value;

    const payload: CreateJobPostAssignmentDto = {
      party_id: Number(formValue.party_id),
      person_id: Number(formValue.person_id),
      job_post_type_id: Number(formValue.job_post_type_id),
      phone: formValue.phone,
    };

    this.jobPostStore.createJobPostAssignment(payload);
  }

  listenFroResult(): void {
    this.jobPostStore.result$.subscribe((res) => {
      if (res.action === 'create_assignment') {
        if (res.result === 'success') {
          this.notification.success('موفق', 'مسپولیت با موفقیت به فرد مورد نظر اختصاص داده شد.');
          this.onClose.emit();
        } else {
          this.notification.error(
            'خطا',
            'اختصاص مسپولیت با مشکل مواجه شد.'
          );
        }
      }
    })
  }

  private validateForm(form: FormGroup): void {
    Object.values(form.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}
