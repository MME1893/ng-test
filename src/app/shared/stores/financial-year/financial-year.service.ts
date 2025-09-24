import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { FinancialYearState, FinancialYear } from '../../models/financial-year.model';
import { switchMap, tap } from 'rxjs';
import { FinancialYearService } from '../../services/financial-year/financial-year.service';

const LOCAL_STORAGE_KEY = 'selectedFinancialYear';

const initialState: FinancialYearState = {
  error: null,
  isLoading: false,
  selectedYear: null,
  years: []
};

@Injectable({
  providedIn: 'root'
})
export class FinancialYearStore extends ComponentStore<FinancialYearState> {
  constructor(private readonly financialYearService: FinancialYearService) {
    super(initialState);

    const storedYear = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedYear) {
      this.patchState({ selectedYear: +storedYear });
    }
  }

  public readonly vm = this.selectSignal(s => s);

  readonly setSelectedYear = this.updater<number | null>((state, year) => {
    if (year) {
      localStorage.setItem(LOCAL_STORAGE_KEY, year.toString());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    return {
      ...state,
      selectedYear: year
    };
  });

  loadYears(callbacks?: { success?: () => void; error?: (err: any) => void }) {
    this.patchState({ isLoading: true, error: null });

    this.financialYearService.getAll().subscribe({
      next: (data: FinancialYear[]) => {
        this.patchState({
          years: data.sort((a, b) => a.year - b.year),
          isLoading: false
        });
        callbacks?.success?.();
      },
      error: (err) => {
        this.patchState({
          error: err,
          isLoading: false
        });
        callbacks?.error?.(err);
      }
    });
  }

  addYear(year: number, callbacks?: { success?: (year: FinancialYear) => void; error?: (err: any) => void }) {
    this.patchState({ isLoading: true, error: null });

    this.financialYearService.add(year).subscribe({
      next: (added: FinancialYear) => {
        this.patchState((state) => ({
          ...state,
          years: [...state.years, added].sort((a, b) => a.year - b.year),
          isLoading: false
        }));
        callbacks?.success?.(added);
      },
      error: (err) => {
        this.patchState({
          error: err,
          isLoading: false
        });
        callbacks?.error?.(err);
      }
    });
  }


  deleteYear(year: number, callbacks?: { success?: () => void; error?: (err: any) => void }) {
    this.patchState({ isLoading: true, error: null });

    this.financialYearService.delete(year).subscribe({
      next: () => {
        this.patchState((state) => {
          const updatedYears = state.years.filter((y) => y.year !== year);
          const newSelected = state.selectedYear === year ? null : state.selectedYear;
          if (newSelected === null) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
          return {
            ...state,
            years: updatedYears,
            isLoading: false,
            selectedYear: newSelected
          };
        });
        callbacks?.success?.();
      },
      error: (err) => {
        this.patchState({
          error: err,
          isLoading: false
        });
        callbacks?.error?.(err);
      }
    });
  }
}