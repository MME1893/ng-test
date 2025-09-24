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

// NG-ZORRO Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzNotificationService } from 'ng-zorro-antd/notification';

// Import the correct model and environment
import { BankAccountType } from '../../../../shared/models/bank.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-bank-account-group',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzPopconfirmModule,
    NzDividerModule,
  ],
  templateUrl: './bank-account-group.component.html',
  styleUrls: ['./bank-account-group.component.scss'],
})
export class BankAccountGroupComponent implements OnInit {
  // Correctly typed as BankAccountType[]
  accountTypes: BankAccountType[] = [];
  isModalVisible = false;
  validateForm!: FormGroup;
  private readonly apiUrl = environment.endpoints.bank.bankAccountType;

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private readonly http: HttpClient
  ) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
    });
    this.getAccountTypes();
  }

  getAccountTypes(): void {
    // Correctly typed to expect an array of BankAccountType
    this.http.get<BankAccountType[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.accountTypes = data;
      },
      error: (err) => {
        this.notification.error(
          'خطا',
          'دریافت اطلاعات گروه‌های حساب با مشکل مواجه شد.'
        );
        console.error(err);
      },
    });
  }

  showModal(): void {
    this.validateForm.reset();
    this.isModalVisible = true;
  }

  handleOk(): void {
    if (this.validateForm.valid) {
      const payload = {
        name: this.validateForm.value.name,
        description: this.validateForm.value.description || '',
      };

      // Correctly typed to post a BankAccountType object
      this.http.post<BankAccountType>(this.apiUrl, payload).subscribe({
        next: () => {
          this.notification.success('موفق', 'گروه جدید با موفقیت ایجاد شد.');
          this.isModalVisible = false;
          this.getAccountTypes(); // Refresh list
        },
        error: (err) => {
          this.notification.error('خطا', 'ایجاد گروه جدید با مشکل مواجه شد.');
          console.error(err);
        },
      });
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  deleteGroup(id: number): void {
    const deleteUrl = `${this.apiUrl}${id}/`;
    this.http.delete(deleteUrl).subscribe({
      next: () => {
        this.notification.info('حذف شد', `گروه حذف گردید.`);
        this.getAccountTypes();
      },
      error: (err) => {
        this.notification.error('خطا', 'حذف گروه با مشکل مواجه شد.');
        console.error(err);
      },
    });
  }
}