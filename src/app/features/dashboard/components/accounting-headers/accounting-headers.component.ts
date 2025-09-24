import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// NG-ZORRO Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTreeModule, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { environment } from '../../../../../environments/environment';
import { ChartOfAccount } from '../../../../shared/models/chart.model';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-accounting-headers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzGridModule,
    NzEmptyModule,
    NzTreeModule,
    NzModalModule,
    NzFormModule
  ],
  templateUrl: './accounting-headers.component.html',
  styleUrls: ['./accounting-headers.component.scss'],
})
export class AccountingHeadersComponent implements OnInit {
  chartAcountApi = environment.endpoints.chartOfAccount;
  ledgerForm!: FormGroup;

  kols: any[] = [];
  moeins: any[] = [];
  tafzilis: any[] = [];
  joezs: any[] = [];
  treeData: NzTreeNodeOptions[] = [];

  createForm!: FormGroup;


  constructor(private fb: FormBuilder, private http: HttpClient, private readonly notification: NzNotificationService) { }

  ngOnInit(): void {
    this.ledgerForm = this.fb.group({
      accounting_name: ['', Validators.required],
      kol: [null, Validators.required],
      moein: [{ value: null, disabled: true }, Validators.required],
      tafzili: [{ value: null, disabled: true }, Validators.required],
      joez: [{ value: null, disabled: true }, Validators.required],
    });

    this.createForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
    });

    this.loadKols();
  }

  loadKols(): void {
    this.http.get<any[]>(this.chartAcountApi.kols).subscribe((res) => {
      this.kols = res;
    });
  }

  onKolChange(kolId: number): void {
    this.moeins = [];
    this.tafzilis = [];
    this.joezs = [];
    this.ledgerForm.patchValue({ moein: null, tafzili: null, joez: null });

    if (kolId) {
      this.http.get<any[]>(this.chartAcountApi.moeins(kolId)).subscribe((res) => {
        this.moeins = res;
        this.ledgerForm.get('moein')?.enable();
      });
    }
  }

  onMoeinChange(moeinId: number): void {
    this.tafzilis = [];
    this.joezs = [];
    this.ledgerForm.patchValue({ tafzili: null, joez: null });

    if (moeinId) {
      this.http.get<any[]>(this.chartAcountApi.tafzilis(moeinId)).subscribe((res) => {
        this.tafzilis = res;
        this.ledgerForm.get('tafzili')?.enable();
      });
    }
  }

  onTafziliChange(tafziliId: number): void {
    this.joezs = [];
    this.ledgerForm.patchValue({ joez: null });

    if (tafziliId) {
      this.http.get<any[]>(this.chartAcountApi.joezs(tafziliId)).subscribe((res) => {
        this.joezs = res;
        this.ledgerForm.get('joez')?.enable();
      });
    }
  }

  onSubmit(): void {
    if (this.ledgerForm.valid) {
      this.http.post(`${this.chartAcountApi.kols}`, this.ledgerForm.value).subscribe({
        next: () => this.notification.success('موفقیت', 'کد حسابداری با موفقیت ثبت شد'),
        error: () => this.notification.error('خطا', 'ثبت کد حسابداری ناموفق بود')
      });
    }
  }


  // create part 

  isModalVisible = false;
  modalTitle = '';
  createTarget: 'kol' | 'moein' | 'tafzili' | null = null;
  isSubmitting = false;

  openCreateModal(target: 'kol' | 'moein' | 'tafzili'): void {
    this.createTarget = target;
    this.modalTitle = target === 'kol' ? 'ایجاد کل جدید'
      : target === 'moein' ? 'ایجاد معین جدید'
        : 'ایجاد تفضیلی جدید';
    this.createForm.reset();
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  onCreateCode(): void {
    if (!this.createTarget || this.createForm.invalid) return;

    const body: any = { ...this.createForm.value };
    let url = '';

    if (this.createTarget === 'kol') {
      url = this.chartAcountApi.kols;
    } else if (this.createTarget === 'moein') {
      const kolId = this.ledgerForm.get('kol')?.value;
      if (!kolId) return;
      url = this.chartAcountApi.moeins(kolId);
      body.kol = kolId;
    } else if (this.createTarget === 'tafzili') {
      const moeinId = this.ledgerForm.get('moein')?.value;
      if (!moeinId) return;
      url = this.chartAcountApi.tafzilis(moeinId);
      body.moein = moeinId;
    }

    this.isSubmitting = true;
    this.http.post(url, body).subscribe({
      next: () => {
        this.notification.success('موفقیت', 'کد جدید ثبت شد');
        this.isSubmitting = false;
        this.isModalVisible = false;
        this.createForm.reset();

        // reload dropdowns
        if (this.createTarget === 'kol') this.loadKols();
        if (this.createTarget === 'moein') this.onKolChange(this.ledgerForm.get('kol')?.value);
        if (this.createTarget === 'tafzili') this.onMoeinChange(this.ledgerForm.get('moein')?.value);
      },
      error: () => {
        this.notification.error('خطا', 'ثبت کد انجام نشد');
        this.isSubmitting = false;
      }
    });
  }
}