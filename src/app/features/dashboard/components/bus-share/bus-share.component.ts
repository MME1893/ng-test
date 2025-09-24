import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { NzRadioModule } from 'ng-zorro-antd/radio';

import { environment } from '../../../../../environments/environment';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card.component';
import { Contribution, ContributionDetail, DisplayBusShare } from '../../../../shared/models/contribution.model';
import { Region } from '../../../../shared/models/region.model';
import { Organization } from '../../../../shared/models/organization.model';
import { StatCard } from '../../../../shared/models/status-card.model';
import { FinancialYear } from '../../../../shared/models/financial-year.model';

@Component({
  selector: 'app-bus-share',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzTableModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzRadioModule,
    StatusCardComponent,
    CurrencyPipe,
  ],
  providers: [CurrencyPipe],
  templateUrl: './bus-share.component.html',
  styleUrls: ['./bus-share.component.scss'],
})
export class BusShareComponent implements OnInit {
  isModalVisible = false;
  shareForm!: FormGroup;

  // This ID is used to filter for "Bus Share" type contributions. Assuming '2'.
  private readonly BUS_SHARE_TYPE_ID = 2;

  stats: StatCard[] = [
    { title: 'کل سهم اتوبوسرانی', value: '0', icon: 'car' },
    { title: 'مجموع مبالغ', value: '۰ ریال', icon: 'money-collect' },
    { title: 'میانگین مبلغ', value: '۰ ریال', icon: 'fund' },
  ];

  // Data stores
  displayShares: DisplayBusShare[] = [];
  financialYears: FinancialYear[] = [];
  regions: Region[] = [];
  organizations: Organization[] = [];

  // API URLs
  private readonly contributionApi = environment.endpoints.contribution;
  private readonly contributionDetailApi = environment.endpoints.contributionDetail;
  private readonly financialYearApi = environment.endpoints.financialYear;
  private readonly regionApi = environment.endpoints.region;
  private readonly organizationApi = environment.endpoints.organization;

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private http: HttpClient,
    private currencyPipe: CurrencyPipe
  ) { }

  ngOnInit(): void {
    this.loadInitialData();

    this.shareForm = this.fb.group({
      fin_year: [null, [Validators.required]],
      party_type: ['region', [Validators.required]],
      party_id: [null, [Validators.required]],
      amount: [null, [Validators.required, Validators.min(0)]],
      description: [null],
    });
  }

  loadInitialData(): void {
    forkJoin({
      contributions: this.http.get<Contribution[]>(this.contributionApi),
      details: this.http.get<ContributionDetail[]>(this.contributionDetailApi),
      financialYears: this.http.get<FinancialYear[]>(this.financialYearApi),
      regions: this.http.get<Region[]>(this.regionApi.root),
      organizations: this.http.get<Organization[]>(this.organizationApi),
    }).subscribe({
      next: (data) => {
        this.financialYears = data.financialYears;
        this.regions = data.regions;
        this.organizations = data.organizations;
        this.processAndSetDisplayData(data.contributions, data.details);
      },
      error: (err) => this.handleApiError('دریافت اطلاعات اولیه', err),
    });
  }

  private processAndSetDisplayData(contribs: Contribution[], details: ContributionDetail[]): void {
    const partyMap = new Map<string, Map<number, string>>();
    partyMap.set('region', new Map(this.regions.map((r) => [r.id, r.name])));
    partyMap.set('organization', new Map(this.organizations.map((o) => [o.id, o.name])));

    const busContributions = contribs.filter(
      (c) => c.contribution_type_id === this.BUS_SHARE_TYPE_ID
    );

    this.displayShares = busContributions.map((c) => {
      const detail = details.find(d => d.contribution_id === c.id);
      const partyName = partyMap.get(c.party_type)?.get(c.party_id) || 'ناشناخته';
      return {
        ...c,
        party_name: partyName,
        detail: detail!,
      };
    }).filter(ds => ds.detail);

    this.updateStats();
  }

  private updateStats(): void {
    this.stats[0].value = this.displayShares.length.toString();
    const totalAmount = this.displayShares.reduce((acc, s) => acc + s.total_amount, 0);
    this.stats[1].value = this.currencyPipe.transform(totalAmount, 'IRR', '', '1.0-0') || '۰ ریال';

    if (this.displayShares.length > 0) {
      const averageAmount = totalAmount / this.displayShares.length;
      this.stats[2].value = this.currencyPipe.transform(averageAmount, 'IRR', '', '1.0-0') || '۰ ریال';
    } else {
      this.stats[2].value = '۰ ریال';
    }
  }

  showModal(): void {
    this.shareForm.reset({ party_type: 'region' });
    this.isModalVisible = true;
  }

  handleOk(): void {
    if (this.shareForm.valid) {
      const formValue = this.shareForm.value;
      const contributionPayload = {
        party_type: formValue.party_type,
        party_id: formValue.party_id,
        fin_year: formValue.fin_year,
        contribution_type_id: this.BUS_SHARE_TYPE_ID,
        date: new Date().toISOString().split('T')[0],
        total_amount: formValue.amount,
        description: formValue.description,
      };

      this.http.post<Contribution>(this.contributionApi, contributionPayload).subscribe({
        next: (newContribution) => {
          const detailPayload = {
            contribution_id: newContribution.id,
            party_id: 4,
            amount: formValue.amount,
            percentage: 0,
            amnt_or_prcntg: false, // Bus share is always an amount
          };

          this.http.post(this.contributionDetailApi, detailPayload).subscribe({
            next: () => {
              this.notification.success('موفق', 'سهم اتوبوسرانی جدید با موفقیت ذخیره شد.');
              this.isModalVisible = false;
              this.loadInitialData();
            },
            error: (err) => this.handleApiError('ایجاد جزئیات سهم', err),
          });
        },
        error: (err) => this.handleApiError('ایجاد سهم اصلی', err),
      });
    } else {
      Object.values(this.shareForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private handleApiError(action: string, error: any) {
    this.notification.error('خطا', `${action} با مشکل مواجه شد.`);
    console.error(error);
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }
}
