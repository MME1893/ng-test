import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { FinancialYearStore } from '../../../../shared/stores/financial-year/financial-year.service';

@Component({
  selector: 'app-financial-year',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputNumberModule,
    NzPopconfirmModule,
    NzEmptyModule,
    NzModalModule,
  ],
  templateUrl: './financial-year.component.html',
  styleUrls: ['./financial-year.component.scss'],
})
export class FinancialYearComponent implements OnInit {
  private store = inject(FinancialYearStore);
  private notification = inject(NzNotificationService);

  public readonly vm = this.store.vm;

  isModalVisible = signal<boolean>(false);
  newFinancialYear = signal<number | null>(null);

  ngOnInit(): void {
    this.store.loadYears();
  }

  showModal(): void {
    this.newFinancialYear.set(null);
    this.isModalVisible.set(true);
  }

  handleOk(): void {
    const nFYear = this.newFinancialYear();
    if (!nFYear) {
      this.notification.error('خطا', 'لطفا سال مالی را وارد کنید.');
      return;
    }

    if (this.vm().years.some(y => y.year === this.newFinancialYear())) {
      this.notification.warning('تکراری', `سال مالی ${nFYear} قبلا ثبت شده است.`);
      return;
    }

    if (nFYear !== null) {
      this.store.addYear(nFYear, {
        success: () => {
          this.notification.success('موفق', `سال مالی ${nFYear} با موفقیت افزوده شد.`);
          this.isModalVisible.set(false);
        },
        error: () => {
          this.notification.error('خطا', 'افزودن سال مالی با مشکل مواجه شد.');
        },
      });
    }
  }

  handleCancel(): void {
    this.isModalVisible.set(false);
  }

  deleteYear(yearToDelete: number): void {
    this.store.deleteYear(yearToDelete, {
      success: () => {
        this.notification.info('حذف شد', `سال مالی ${yearToDelete} حذف گردید.`);
      },
      error: () => {
        this.notification.error('خطا', `حذف سال مالی ${yearToDelete} با مشکل مواجه شد.`);
      },
    });
  }

  onChangeYear(year: number): void {
    this.newFinancialYear.set(year);
  }
}