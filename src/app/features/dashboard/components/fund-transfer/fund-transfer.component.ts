import { Component, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PageLayoutComponent } from '../../../../layouts/page-layout/page-layout.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { SubmitTransferFundModalComponent } from './components/submit-transfer-fund-modal/submit-transfer-fund-modal.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { FinancialYearStore } from '../../../../shared/stores/financial-year/financial-year.service';

export interface TransactionRequest {
  id: number,
  party_id: number,
  party_name: string,
  reason: string,
  total_amount: string
}

@Component({
  selector: 'app-fund-transfer',
  imports: [
    NzTabsModule,
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzRadioModule,
    NzSelectModule,
    NzInputModule,
    NzInputNumberModule,
    NzFormModule,
    NzGridModule,
    NzCardModule,
    NzSpinModule,
    PageLayoutComponent,
    SubmitTransferFundModalComponent,
    NzTableModule
  ],
  templateUrl: './fund-transfer.component.html',
  styleUrl: './fund-transfer.component.scss'
})
export class FundTransferComponent {
  public tabName = signal<"org" | "region">("region");
  public selectedItem = signal<number>(0);
  public isSubmitTransferFundModalOpen = signal<boolean>(false);
  public transactionRequests = signal<TransactionRequest[]>([]);
  private readonly api = environment.endpoints.transferRequests;


  constructor(private readonly http: HttpClient, private readonly finYearStore: FinancialYearStore) {
    this.fetchTransactionRequests();
  }

  onSelectTransactionItem(itemId: number): void {
    this.selectedItem.set(itemId);
    this.isSubmitTransferFundModalOpen.set(true);
  }

  fetchTransactionRequests(): void {
    this.http.get<TransactionRequest[]>(this.api(this.tabName(), String(this.finYearStore.vm().selectedYear))).subscribe({
      next: (res) => {
        this.transactionRequests.set(res);
        console.log(res);
      },
      error: (err) => console.log(err)
    })
  }

  onRejectRequest(): void {

  }

  onSelectedPageChange(): void {
    this.tabName.update(name => name === 'region' ? 'org' : 'region');
    this.fetchTransactionRequests();
  }

  getTabFarsiName(): string {
    return this.tabName() === "region" ? 'مناطق' : 'سازمان ها'
  }
}
