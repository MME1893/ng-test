import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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

import { environment } from '../../../../../environments/environment';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card.component';
import { Contribution, ContributionDetail, DisplayOrgReserve } from '../../../../shared/models/contribution.model';
import { Organization } from '../../../../shared/models/organization.model';
import { StatCard } from '../../../../shared/models/status-card.model';
import { FinancialYear } from '../../../../shared/models/financial-year.model';

@Component({
  selector: 'app-org-reserve-percentage',
  standalone: true,
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
    StatusCardComponent,
  ],
  providers: [CurrencyPipe],
  templateUrl: './org-reserve-percentage.component.html',
  styleUrls: ['./org-reserve-percentage.component.scss'],
})
export class OrgReservePercentageComponent implements OnInit {
  isModalVisible = false;
  fundForm!: FormGroup;

  private readonly ORG_RESERVE_TYPE_ID = 1;

  stats: StatCard[] = [
    { title: 'کل درصد صندوق ذخیره سازمان ها', value: '0', icon: 'percentage' },
    { title: 'میانگین درصد', value: '0%', icon: 'percentage' },
    { title: 'سازمان های تحت پوشش', value: '0', icon: 'file-text' },
  ];

  // Data stores
  displayReserves: DisplayOrgReserve[] = [];
  financialYears: FinancialYear[] = [];
  organizations: Organization[] = [];

  // API URLs
  private readonly contributionApi = environment.endpoints.contribution;
  private readonly contributionDetailApi = environment.endpoints.contributionDetail;
  private readonly financialYearApi = environment.endpoints.financialYear;
  private readonly organizationApi = environment.endpoints.organization;

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadInitialData();

    this.fundForm = this.fb.group({
      fin_year: [null, [Validators.required]],
      party_id: [null, [Validators.required]],
      percentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      description: [null],
    });
  }

  loadInitialData(): void {
    forkJoin({
      contributions: this.http.get<Contribution[]>(this.contributionApi),
      details: this.http.get<ContributionDetail[]>(this.contributionDetailApi),
      financialYears: this.http.get<FinancialYear[]>(this.financialYearApi),
      organizations: this.http.get<Organization[]>(this.organizationApi),
    }).subscribe({
      next: (data) => {
        this.financialYears = data.financialYears;
        this.organizations = data.organizations;
        this.processAndSetDisplayData(data.contributions, data.details);
      },
      error: (err) => this.handleApiError('دریافت اطلاعات اولیه', err),
    });
  }

  private processAndSetDisplayData(contribs: Contribution[], details: ContributionDetail[]): void {
    const orgMap = new Map(this.organizations.map((o) => [o.id, o.name]));

    const orgReserveContributions = contribs.filter(
      (c) => c.contribution_type_id === this.ORG_RESERVE_TYPE_ID
    );

    this.displayReserves = orgReserveContributions.map((c) => {
      const detail = details.find(d => d.contribution_id === c.id);
      const partyName = orgMap.get(c.party_id) || 'ناشناخته';
      return {
        ...c,
        party_name: partyName,
        detail: detail!,
      };
    }).filter(ds => ds.detail);

    this.updateStats();
  }

  private updateStats(): void {
    this.stats[0].value = this.displayReserves.length.toString();
    const uniqueOrgs = new Set(this.displayReserves.map(s => s.party_id)).size;
    this.stats[2].value = uniqueOrgs.toString();

    if (this.displayReserves.length > 0) {
      const totalPercentage = this.displayReserves.reduce((acc, s) => acc + (s.detail.percentage || 0), 0);
      const avgPercentage = totalPercentage / this.displayReserves.length;
      this.stats[1].value = `${avgPercentage.toFixed(2)}%`;
    } else {
      this.stats[1].value = '0%';
    }
  }

  showModal(): void {
    this.fundForm.reset();
    this.isModalVisible = true;
  }

  handleOk(): void {
    if (this.fundForm.valid) {
      const formValue = this.fundForm.value;
      const contributionPayload = {
        party_type: 'organization', // This is always organization for this component
        party_id: formValue.party_id,
        fin_year: formValue.fin_year,
        contribution_type_id: this.ORG_RESERVE_TYPE_ID,
        date: new Date().toISOString().split('T')[0],
        total_amount: 0, // Amount is 0 for percentage-based contributions
        description: formValue.description,
      };

      this.http.post<Contribution>(this.contributionApi, contributionPayload).subscribe({
        next: (newContribution) => {
          const detailPayload = {
            contribution_id: newContribution.id,
            party_id: 2,
            amount: 0,
            percentage: formValue.percentage,
            amnt_or_prcntg: true, // Organization reserve is always a percentage
          };

          this.http.post(this.contributionDetailApi, detailPayload).subscribe({
            next: () => {
              this.notification.success('موفق', 'درصد صندوق ذخیره جدید با موفقیت ذخیره شد.');
              this.isModalVisible = false;
              this.loadInitialData();
            },
            error: (err) => this.handleApiError('ایجاد جزئیات سهم', err),
          });
        },
        error: (err) => this.handleApiError('ایجاد سهم اصلی', err),
      });
    } else {
      Object.values(this.fundForm.controls).forEach((control) => {
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
