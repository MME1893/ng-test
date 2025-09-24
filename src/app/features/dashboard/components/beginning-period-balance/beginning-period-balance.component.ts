import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, of, filter } from 'rxjs';

// NG-ZORRO Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';

// Models & Stores
import { FinancialYearStore } from '../../../../shared/stores/financial-year/financial-year.service';
import { OweByFinancialYear } from '../../../../shared/models/owe-type.model';
import { RegionStore } from '../../../../shared/stores/region/region-store.service';
import { OweTypeStore } from '../../../../shared/stores/owe-type/owe-type-store.service';
import { RegionalDebtHeaderStore } from '../../../../shared/stores/regional-debt-header/regional-debt-header-store.service';

// **MODIFIED**: Interface now includes a unique key for form controls
interface FormField {
  id: number; // The original ID from the backend (can be duplicated)
  controlKey: string; // A unique key for the form control
  name: string;
  description: string;
  parentId: number;
}

interface DynamicField {
  name: string;
  description: string;
  id: number;
}

@Component({
  selector: 'app-beginning-period-balance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTabsModule,
    NzFormModule,
    NzSelectModule,
    NzInputModule,
    NzButtonModule,
    NzGridModule,
    NzToolTipModule,
    NzDividerModule,
    NzMessageModule
  ],
  templateUrl: './beginning-period-balance.component.html',
  styleUrl: './beginning-period-balance.component.scss'
})
export class BeginningPeriodBalanceComponent implements OnInit, OnDestroy {
  // Injected services and stores
  private fb = inject(FormBuilder);
  private readonly financialYearStore = inject(FinancialYearStore);
  private readonly oweTypeStore = inject(OweTypeStore);
  private readonly regionStore = inject(RegionStore);
  private readonly regionalDebtHeaderStore = inject(RegionalDebtHeaderStore);
  private readonly message = inject(NzMessageService);

  // Form properties
  mainForm: FormGroup;
  fieldToAddControl = new FormControl<number | null>(null);
  addedFields: FormField[] = [];
  optionalFields: DynamicField[] = [];
  private destroy$ = new Subject<void>();
  private optionalFieldIndex = 0; // Counter for unique optional field keys

  // ViewModels from stores for easy template access
  public readonly financialYearVm = this.financialYearStore.vm;
  public readonly oweTypeVm = this.oweTypeStore.vm;
  public readonly regionVm = this.regionStore.vm;
  public readonly regionalDebtVm = this.regionalDebtHeaderStore.vm;

  constructor() {
    this.mainForm = this.fb.group({
      financialYear: [this.financialYearVm().selectedYear, [Validators.required]],
      municipalityZone: [this.regionStore.vm().regions, [Validators.required]],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadInitialFieldsFromStore();
    this.loadOptionalFields();
    this.mainForm.get('financialYear')?.valueChanges.subscribe(selectedYear =>
      this.oweTypeStore.fetchOwesByFinancialYear(selectedYear)
    );
    this.listenForFetchResult();
    this.listenForSubmitResult();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenForFetchResult(): void {
    this.oweTypeStore.result$
      .pipe(
        filter(res => res.action === 'fetch_by_year' && res.result === 'success'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.transformOwesToFields(this.oweTypeVm().owesByFinancialYear);
      });
  }

  private listenForSubmitResult(): void {
    this.regionalDebtHeaderStore.result$
      .pipe(
        filter(res => res.action === 'submit_debt'),
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        if (res.result === 'success') {
          this.message.success('اطلاعات با موفقیت ثبت شد');
        } else {
          const errorMsg = this.regionalDebtVm().error || 'خطا در ثبت اطلاعات';
          this.message.error(errorMsg);
        }
      });
  }

  // **MODIFIED**: Handles duplicate IDs by creating unique control keys
  private transformOwesToFields(owesByYear: OweByFinancialYear | null): void {
    if (!owesByYear) return;

    // Remove old dynamic controls before adding new ones
    this.addedFields.forEach(field => this.mainForm.removeControl(`dynamic_${field.controlKey}`));
    this.addedFields = [];

    const transformedFields: FormField[] = [];
    let controlIndex = 0; // Counter to ensure key uniqueness

    for (const key in owesByYear) {
      const category = owesByYear[key];
      for (const item of category.items) {
        const uniqueControlKey = `${item.owe_id}_${controlIndex++}`;
        transformedFields.push({
          id: item.owe_id,
          controlKey: uniqueControlKey,
          name: item.name,
          description: `از دسته: ${key}`,
          parentId: category.owe_type_id
        });
      }
    }
    this.addedFields = transformedFields;
    this.addedFields.forEach(field => this.addFormControlForField(field));
  }

  private loadOptionalFields(): void {
    of<DynamicField[]>([
      { name: 'سهم متمرکز (بدهکار/بستانکار)', description: '...', id: 3 },
      { name: 'سایر حساب‌ها', description: '...', id: 4 },
      { name: 'جرائم', description: '...', id: 5 },
    ]).subscribe(optional => {
      this.optionalFields = optional;
    });
  }

  // **MODIFIED**: Now uses controlKey for submission payload
  save(): void {
    if (this.mainForm.invalid) {
      Object.values(this.mainForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const formValue = this.mainForm.value;

    const header = {
      region_id: Number(formValue.municipalityZone),
      fin_year_id: Number(formValue.financialYear),
      description: formValue.description
    };

    const detail = this.addedFields.map(field => {
      const dynamicGroupValue = formValue[`dynamic_${field.controlKey}`];
      return {
        owe_type_id: field.parentId,
        owe_id: field.id, // <-- Sends the original ID to the backend
        amount: (dynamicGroupValue.value || 0) * dynamicGroupValue.sign
      };
    });

    const payload = { header, detail };
    this.regionalDebtHeaderStore.submitDebt(payload);
  }

  get availableFields(): DynamicField[] {
    return this.optionalFields.filter(
      optField => !this.addedFields.some(added => added.id === optField.id)
    );
  }

  // **MODIFIED**: Uses controlKey to add form controls
  private addFormControlForField(field: FormField): void {
    const fieldGroup = this.fb.group({
      value: [null, [Validators.required, Validators.min(0)]],
      sign: [1, [Validators.required]],
    });
    this.mainForm.addControl(`dynamic_${field.controlKey}`, fieldGroup);
  }

  addField(): void {
    const fieldId = this.fieldToAddControl.value;
    if (!fieldId) return;

    const fieldToAdd = this.optionalFields.find(f => f.id === fieldId);
    if (fieldToAdd) {
      const controlKey = `${fieldToAdd.id}_opt_${this.optionalFieldIndex++}`;
      const newFormField: FormField = {
        id: fieldToAdd.id,
        controlKey: controlKey,
        name: fieldToAdd.name,
        description: fieldToAdd.description,
        parentId: -1
      };
      this.addedFields.push(newFormField);
      this.addFormControlForField(newFormField);
      this.fieldToAddControl.reset();
    }
  }

  // **MODIFIED**: All helper methods now use the unique controlKey
  getSignControl(controlKey: string): FormControl | null {
    return this.mainForm.get(`dynamic_${controlKey}.sign`) as FormControl;
  }

  setSign(controlKey: string, sign: 1 | -1): void {
    this.getSignControl(controlKey)?.setValue(sign);
  }

  getFieldPrefix(controlKey: string): string {
    return this.getSignControl(controlKey)?.value === 1 ? 'بستانکاری ' : 'بدهکاری ';
  }

  private loadInitialFieldsFromStore(finyear?: number): void {
    const currentYear = this.financialYearVm().selectedYear || finyear;
    if (!currentYear) {
      return;
    }
    this.oweTypeStore.fetchOwesByFinancialYear(currentYear);
  }
}