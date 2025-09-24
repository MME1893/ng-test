import { Component, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { RegionStore } from '../../../../../shared/stores/region/region-store.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-create-region-modal',
  imports: [
    NzModalModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-region-modal.component.html',
  styleUrl: './create-region-modal.component.scss'
})
export class CreateRegionModalComponent implements OnInit {
  onClose = output<void>();

  regionForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private readonly regionStore: RegionStore,
    private readonly notification: NzNotificationService,
  ) { }

  ngOnInit(): void {
    this.regionForm = this.fb.group({
      name: ['', [Validators.required]],
    });

    this.listenFroResult();
  }

  onCreateRegion(): void {
    if (!this.regionForm.valid) return;

    const palyload = this.regionForm.value;

    this.regionStore.createRegion(palyload);
  }

  listenFroResult(): void {
    this.regionStore.result$.subscribe((res) => {
      if (res.action === 'create') {
        if (res.result === 'success') {
          this.notification.success('موفق', 'منطقه جدید با موفقیت ایجاد شد.');
          this.onClose.emit();
        } else {
          this.notification.error(
            'خطا',
            'ایجاد منطقه جدید با مشکل مواجه شد.'
          );
        }
      }
    })
  }
}
