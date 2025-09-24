import { Component, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// NG-ZORRO Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CreateShareModalComponent } from './components/create-share-modal/create-share-modal.component';

interface ContributionDetail {
  contribution_id: number;
  party_id: number;
  percentage: string;
  amount: string;
  id: number;
}

@Component({
  selector: 'app-central-share',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzTableModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzRadioModule,
    CreateShareModalComponent
  ],
  providers: [CurrencyPipe],
  templateUrl: './central-share.component.html',
  styleUrl: './central-share.component.scss'
})
export class CentralShareComponent {
  party_type_id = signal<number>(1);
  isAmount = signal<boolean>(false);
  contribution_id = signal<number>(0);
  partTypeName = computed(() => {
    return this.party_type_id() === 1 ? 'مناطق' : 'سازمان ها';
  })
  contributionDetail = signal<ContributionDetail[]>([]);
  displayedContDetail = computed(() => {
    return this.contributionDetail().filter(c => c.party_id === this.party_type_id())
  })
  isCreateShareModalVisible = signal<boolean>(false);

  private readonly contributionApi = environment.endpoints.contribution;
  private readonly contributionDetailApi = environment.endpoints.contributionDetail;

  constructor(
    private http: HttpClient,
    private readonly messageService: NzMessageService,
    private readonly activateRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.subscribeQeryParamsChanges();
  }

  toggleCreateShareModalvisibility(): void {
    this.isCreateShareModalVisible.update(v => v ? false : true)
  }

  closeCreateShareModal(): void {
    this.toggleCreateShareModalvisibility();
  }

  subscribeQeryParamsChanges(): void {
    this.activateRoute.queryParams.subscribe(({ party_type_id, amnt_or_prcntg, contribution_id }) => {
      if (contribution_id) this.contribution_id.set(Number(contribution_id));
      if (party_type_id) this.party_type_id.set(Number(party_type_id));
      if (amnt_or_prcntg !== undefined) this.isAmount.set(amnt_or_prcntg === 'true');
      this.fetchContributionDetail();
    });
  }

  fetchContributionDetail(): void {
    this.http.get<ContributionDetail[]>(this.contributionDetailApi).subscribe({
      next: (res) => { this.contributionDetail.set(res) },
      error: (error) => {
        this.messageService.error('خطا در دریافت اطلاعات سهم متمرکز');
      }
    })
  }

  submitAll(): void {
    let params = new HttpParams();
    params = params.set('contribution_id', this.contribution_id());

    this.http.post(`${this.contributionDetailApi}submit-all/`, {}, { params }).subscribe({
      next: () => this.messageService.success("سهام ها به صورت مساوی اختصاص یافتند"),
      error: () => this.messageService.error("خطا در ثبت سهام به صورت یکسان برای همه")
    });
  }
}
