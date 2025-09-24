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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzNotificationService } from 'ng-zorro-antd/notification';


import { environment } from '../../../../../environments/environment';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card.component';
import { forkJoin } from 'rxjs';
import { Bank, BankAccountType } from '../../../../shared/models/bank.model';
import { StatCard } from '../../../../shared/models/status-card.model';
import { FileImporterComponent } from '../../../../shared/components/file-importer/file-importer.component';
import { SearchComponent } from '../../../../shared/components/search/search.component';

@Component({
  selector: 'app-banks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzTableModule,
    NzDividerModule,
    NzPopconfirmModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzGridModule,
    StatusCardComponent,
    StatusCardComponent,
    FileImporterComponent,
    SearchComponent
  ],
  templateUrl: './banks.component.html',
  styleUrls: ['./banks.component.scss'],
})
export class BanksComponent implements OnInit {
  isBankModalVisible = false;
  isAccountModalVisible = false;

  bankForm!: FormGroup;
  accountForm!: FormGroup;

  isBranchModalVisible = false;
  branchForm!: FormGroup;


  stats: StatCard[] = [
    { title: 'گروه‌های حساب', value: '0', icon: 'group' },
    { title: 'کل حساب‌ها', value: '0', icon: 'solution' },
    { title: 'کل بانک‌ها', value: '0', icon: 'bank' },
    { title: 'کل شعب', value: '0', icon: 'shop' }
  ];

  // Data stores
  banks: Bank[] = [];
  accountTypes: BankAccountType[] = [];

  // API URLs
  private readonly bankApiUrl = environment.endpoints.bank;
  private readonly accountApiUrl = environment.endpoints.bank.bankAccount;
  private readonly accountTypeApiUrl = environment.endpoints.bank.bankAccountType;
  private readonly branchApiUrl = environment.endpoints.bank.branch;

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private readonly http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadInitialData();

    this.bankForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
    });

    this.accountForm = this.fb.group({
      accountNo: ['', [Validators.required]],
      shebaNo: ['', [Validators.required, Validators.pattern(/^(IR|ir)[0-9]{24}$/)]],
      bank_id: [null, [Validators.required]],
      account_type_id: [null, [Validators.required]],
      description: [''],
    });

    this.branchForm = this.fb.group({
      name: ['', [Validators.required]],
      branch_code: ['', [Validators.required]],
      address: [''],
      bank_id: [null, [Validators.required]],
    });
  }

  // Replace your existing loadInitialData method with this updated version
  loadInitialData(): void {
    forkJoin({
      banks: this.http.get<Bank[]>(this.bankApiUrl.root),
      accountTypes: this.http.get<BankAccountType[]>(this.accountTypeApiUrl),
      accounts: this.http.get<any[]>(this.accountApiUrl),
      branches: this.http.get<any[]>(this.branchApiUrl)
    }).subscribe({
      next: ({ banks, accountTypes, accounts, branches }) => {
        this.banks = banks;
        this.accountTypes = accountTypes;

        // Update stat cards
        this.stats[0].value = this.accountTypes.length.toString();
        this.stats[1].value = accounts.length.toString();
        this.stats[2].value = this.banks.length.toString();
        this.stats[3].value = branches.length.toString(); // Update new stat card
      },
      error: (err) => {
        this.notification.error('خطا', 'دریافت اطلاعات اولیه با مشکل مواجه شد.');
        console.error(err);
      }
    });
  }

  showBankModal(): void {
    this.bankForm.reset();
    this.isBankModalVisible = true;
  }

  handleBankOk(): void {
    if (this.bankForm.valid) {
      this.http.post<Bank>(this.bankApiUrl.root, this.bankForm.value).subscribe({
        next: () => {
          this.notification.success('موفق', 'بانک جدید با موفقیت ایجاد شد.');
          this.isBankModalVisible = false;
          this.loadInitialData();
        },
        error: (err) => {
          this.notification.error('خطا', 'ایجاد بانک جدید با مشکل مواجه شد.');
          console.error(err);
        },
      });
    } else {
      this.validateForm(this.bankForm);
    }
  }

  handleBankCancel(): void {
    this.isBankModalVisible = false;
  }

  deleteBank(id: number): void {
    const deleteUrl = `${this.bankApiUrl}${id}/`;
    this.http.delete(deleteUrl).subscribe({
      next: () => {
        this.notification.info('حذف شد', 'بانک مورد نظر حذف گردید.');
        this.loadInitialData();
      },
      error: (err) => {
        this.notification.error('خطا', 'حذف بانک با مشکل مواجه شد.');
        console.error(err);
      },
    });
  }

  showAccountModal(): void {
    this.accountForm.reset();
    this.isAccountModalVisible = true;
  }

  handleAccountOk(): void {
    if (this.accountForm.valid) {
      this.http.post(this.accountApiUrl, this.accountForm.value).subscribe({
        next: () => {
          this.notification.success('موفق', 'حساب بانکی جدید با موفقیت ایجاد شد.');
          this.isAccountModalVisible = false;
          this.loadInitialData();
        },
        error: err => {
          this.notification.error('خطا', 'ایجاد حساب بانکی با مشکل مواجه شد.');
          console.error(err);
        }
      });
    } else {
      this.validateForm(this.accountForm);
    }
  }

  handleAccountCancel(): void {
    this.isAccountModalVisible = false;
  }

  private validateForm(form: FormGroup): void {
    Object.values(form.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  // Add these new methods for the branch modal
  showBranchModal(): void {
    this.branchForm.reset();
    this.isBranchModalVisible = true;
  }

  handleBranchOk(): void {
    if (this.branchForm.valid) {
      const payload = { ...this.branchForm.value };

      payload.bank_id = Number(payload.bank_id);

      this.http.post(this.branchApiUrl, payload).subscribe({
        next: () => {
          this.notification.success('موفق', 'شعبه جدید با موفقیت ایجاد شد.');
          this.isBranchModalVisible = false;
          this.loadInitialData(); // Reload data to update stats
        },
        error: err => {
          this.notification.error('خطا', 'ایجاد شعبه جدید با مشکل مواجه شد.');
          console.error(err);
        }
      });
    } else {
      this.validateForm(this.branchForm);
    }
  }

  handleBranchCancel(): void {
    this.isBranchModalVisible = false;
  }
}