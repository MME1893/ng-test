import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
// HttpClientModule is required for standalone components using HttpClient
import { HttpClient, HttpParams } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, catchError, tap, delay } from 'rxjs/operators';

// NG-ZORRO Modules
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';

// --- Interfaces for Clarity ---
export interface SearchCategory {
  key: string;
  displayName: string;
}

export interface SearchResultItem {
  id: number | string;
  title: string;
  subtitle: string;
  icon?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzInputModule,
    NzSelectModule,
    NzIconModule,
    NzPopoverModule,
    NzSpinModule,
    NzCardModule,
    NzEmptyModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() baseUrl!: string;
  @Input() debounceMs = 400;
  @Input() minLength = 2;

  @Output() resultSelected = new EventEmitter<SearchResultItem>();

  searchForm: FormGroup;
  searchCategories: SearchCategory[] = [];
  searchResults: SearchResultItem[] = [];

  isLoadingCategories = true;
  isSearching = false;
  isPopoverVisible = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient, // http is kept for when you switch to real APIs
    private message: NzMessageService
  ) {
    this.searchForm = this.fb.group({
      category: [null],
      query: [''],
    });
  }

  ngOnInit(): void {
    this.fetchCategories();
    this.listenForSearchChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchCategories(): void {
    this.isLoadingCategories = true;

    // FIXED: Correct way to simulate an API call with mock data and a delay.
    // Replace this 'of(...)' block with 'this.http.get<...>' when you have a real API.
    of<SearchCategory[]>([
      { "key": "employee_name", "displayName": "نام کارمند" },
      { "key": "department", "displayName": "واحد سازمانی" },
      { "key": "item_code", "displayName": "کد کالا" },
      { "key": "invoice_id", "displayName": "شماره فاکتور" }
    ]).pipe(
      delay(1500), // Simulate network latency
      takeUntil(this.destroy$),
      catchError(() => {
        this.message.error('خطا در دریافت دسته‌بندی‌های جستجو');
        return of([]);
      })
    ).subscribe(categories => {
      this.searchCategories = categories;
      if (categories.length > 0) {
        this.searchForm.get('category')?.setValue(categories[0].key);
      }
      this.isLoadingCategories = false;
    });
  }

  private listenForSearchChanges(): void {
    this.queryControl.valueChanges.pipe(
      debounceTime(this.debounceMs),
      filter(query => typeof query === 'string' && query.length >= this.minLength),
      distinctUntilChanged(),
      tap(() => {
        this.isSearching = true;
        this.isPopoverVisible = true;
      }),
      switchMap(query => {
        const category = this.searchForm.get('category')?.value;

        // FIXED: Correct way to simulate the search API call.
        // Replace this 'of(...)' block with your actual http.get call.
        return of<SearchResultItem[]>([
          { "id": 101, "title": "امیر رضایی", "subtitle": "واحد مالی - کارشناس ارشد", "icon": "user" },
          { "id": 102, "title": "سارا محمدی", "subtitle": "واحد فناوری اطلاعات - برنامه‌نویس", "icon": "user" },
          { "id": "INV-001", "title": "فاکتور #INV-001", "subtitle": "مبلغ: ۵,۲۰۰,۰۰۰ ریال", "icon": "file-text" },
          { "id": "IT-DEPT", "title": "دپارتمان فناوری اطلاعات", "subtitle": "ساختمان اصلی، طبقه ۴", "icon": "cluster" },
          { "id": "HW-0345", "title": "کالای HW-0345", "subtitle": "موجودی: ۱۲ عدد", "icon": "shopping-cart" }
        ]).pipe(
          delay(1000), // Simulate search latency
          catchError(() => {
            this.message.error('جستجو با خطا مواجه شد');
            return of([]);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.searchResults = results;
      this.isSearching = false;
    });
  }

  clearSearch(): void {
    this.queryControl.setValue('');
    this.searchResults = [];
    this.isPopoverVisible = false;
  }

  onResultClick(item: SearchResultItem): void {
    this.resultSelected.emit(item);
    this.isPopoverVisible = false;
  }

  get queryControl(): FormControl {
    return this.searchForm.get('query') as FormControl;
  }
}