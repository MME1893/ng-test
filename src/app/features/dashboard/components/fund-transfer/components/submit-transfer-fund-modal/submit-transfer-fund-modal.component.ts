import { Component, input, OnInit, output, OnDestroy } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map, startWith, finalize, catchError } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';

// NG-ZORRO Modules
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';

// --- Interfaces ---
interface ContributionType {
  id: number;
  name: string;
  description: string | null;
  party_type_id: number;
}

interface BankAccount {
  accountNo: string;
  shebaNo: string;
  description: string;
  bank_id: number;
  account_type_id: number;
  id: number;
}

// Define the structure of the data you will send to the API
interface TransferPayload {
  header: {
    final_amount: number;
    src_account_id: number;
    dest_account_id: number;
    transfer_request_id: number;
    issue_date: Date;
  },
  detail: {
    contribution_id: number;
    final_amount: number;
  }[];
}


@Component({
  selector: 'app-submit-transfer-fund-modal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzModalModule, NzFormModule,
    NzInputNumberModule, NzGridModule, NzButtonModule, NzSwitchModule,
    NzDividerModule, NzInputModule, NzSelectModule, AsyncPipe, NzNotificationModule
  ],
  templateUrl: './submit-transfer-fund-modal.component.html',
  styleUrl: './submit-transfer-fund-modal.component.scss'
})
export class SubmitTransferFundModalComponent implements OnInit {
  transferRequestId = input.required<number>();
  onClose = output<void>();

  paymentForm!: FormGroup;
  contributionFields: ContributionType[] = [];
  isLoading = false;
  finalAmount$!: Observable<number>;

  private readonly contributionApi = environment.endpoints.contributionType;
  private readonly fundTransferApi = environment.endpoints.fundTransfer; // **<-- Add this to your environment file**

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notification: NzNotificationService // Inject notification service
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.fetchContributions();
    this.setupFinalAmountCalculation();
    this.loadBankAccounts();
  }

  private readonly bankAccountApi = environment.endpoints.bank.bankAccount;
  bankAccounts$!: Observable<BankAccount[]>;
  loadBankAccounts(): void {
    this.bankAccounts$ = this.http.get<BankAccount[]>(this.bankAccountApi).pipe(
      catchError(error => {
        console.error('Error fetching bank accounts:', error);
        return of([]);
      })
    );
  }

  // **UPDATED**: This method now handles the full API call lifecycle.
  handleOk(): void {
    if (this.paymentForm.invalid) {
      console.log('form is not valid');
      // Mark all controls as dirty to show validation errors
      Object.values(this.paymentForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isLoading = true; // Start loading spinner on the button

    const formData = this.paymentForm.value;

    // Filter for active deductions and map to the required format
    const activeDeductions = this.contributionFields
      .map(field => {
        const controlData = formData.contributions[`contribution_${field.id}`];
        return {
          contribution_id: field.id,
          final_amount: controlData.amount,
          isActive: controlData.isActive,
        };
      })
      .filter(d => d.isActive)
      .map(({ contribution_id, final_amount }) => ({ contribution_id, final_amount }));

    // Construct the final payload to send to the backend
    const finalPayload: TransferPayload = {
      header: {
        final_amount: formData.totalAmount,
        src_account_id: formData.sourceAccountId,
        dest_account_id: formData.destinationAccountId,
        issue_date: new Date(),
        transfer_request_id: this.transferRequestId(),
      },
    detail: activeDeductions,
    };

    console.log(finalPayload);

    // Make the HTTP POST request
    this.http.post(this.fundTransferApi, finalPayload).pipe(
      finalize(() => {
        this.isLoading = false; // Stop loading spinner when done (success or error)
      })
    ).subscribe({
      next: () => {
        this.notification.success('موفق', 'انتقال وجه با موفقیت ثبت شد.');
        this.onClose.emit(); // Close the modal on success
      },
      error: (err) => {
        // Extract a user-friendly error message from the backend response
        const errorMessage = err?.error?.message || 'خطا در ثبت اطلاعات. لطفا دوباره تلاش کنید.';
        this.notification.error('خطا', errorMessage);
        console.error('API Error:', err);
      }
    });
  }

  // --- All other methods remain the same ---

  private initForm(): void {
    this.paymentForm = this.fb.group({
      totalAmount: [null, [Validators.required, Validators.min(0)]],
      sourceAccountId: [null, [Validators.required]],
      destinationAccountId: [null, [Validators.required]],
      contributions: this.fb.group({}),
    });
  }

  private setupFinalAmountCalculation(): void {
    this.finalAmount$ = this.paymentForm.valueChanges.pipe(
      startWith(this.paymentForm.value),
      map(formValue => {
        const totalAmount = formValue.totalAmount || 0;
        let deductionsTotal = 0;
        if (formValue.contributions) {
          Object.values(formValue.contributions).forEach((control: any) => {
            if (control && control.isActive && typeof control.amount === 'number') {
              deductionsTotal += control.amount;
            }
          });
        }
        return totalAmount - deductionsTotal;
      })
    );
  }

  private fetchContributions(): void {
    this.http.get<ContributionType[]>(this.contributionApi).pipe(
      map(items => items.filter(item => item.party_type_id === this.transferRequestId()))
    ).subscribe(filteredData => {
      this.contributionFields = filteredData;
      this.addContributionControls(filteredData);
    });
  }

  private addContributionControls(fields: ContributionType[]): void {
    const contributionsGroup = this.paymentForm.get('contributions') as FormGroup;
    fields.forEach(field => {
      contributionsGroup.addControl(`contribution_${field.id}`, this.fb.group({
        isActive: [true],
        amount: [null, [Validators.required, Validators.min(0)]],
      }));
    });
  }

  getContributionControlGroup(id: number): FormGroup | null {
    return this.paymentForm.get(['contributions', `contribution_${id}`]) as FormGroup;
  }

  formatter = (value: number | null): string => value ? `${value.toLocaleString()}` : '';
  parser = (value: string | null): number => parseFloat(value ? value.replace(/,/g, '') : '0');

  handleCancel(): void {
    this.onClose.emit();
  }
}