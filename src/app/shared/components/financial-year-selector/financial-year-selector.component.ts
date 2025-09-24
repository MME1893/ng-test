import { Component, OnInit, inject } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { FinancialYearStore } from '../../stores/financial-year/financial-year.service';

@Component({
  selector: 'app-financial-year-selector',
  standalone: true,
  imports: [NzSelectModule, FormsModule, NzButtonModule, NzSpinModule],
  templateUrl: './financial-year-selector.component.html',
  styleUrl: './financial-year-selector.component.scss'
})
export class FinancialYearSelectorComponent implements OnInit {
  private store = inject(FinancialYearStore);

  public readonly vm = this.store.vm;

  ngOnInit(): void {
    this.store.loadYears();
  }

  onYearChange(year: number | null): void {
    this.store.setSelectedYear(year);
  }

  retry(): void {
    this.store.loadYears();
  }
}
