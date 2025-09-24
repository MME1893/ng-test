import { Injectable } from '@angular/core';
import { CreateOweTypeDto, FetchOweTypesParams, OweTypeState } from '../../models/owe-type.model';
import { ComponentStore } from '@ngrx/component-store';
import { OweTypeService } from '../../services/owe-type/owe-type.service';
import { Subject, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

const initialState: OweTypeState = {
  oweTypes: [],
  owesByFinancialYear: null,
  isLoading: false,
  error: undefined
};

@Injectable({
  providedIn: 'root'
})
export class OweTypeStore extends ComponentStore<OweTypeState> {
  private readonly _result$ = new Subject<{ action: 'create' | 'update' | 'delete' | 'fetch' | 'fetch_by_year', result: 'success' | 'fail' }>();
  public readonly result$ = this._result$.asObservable();

  constructor(private readonly oweTypeService: OweTypeService) {
    super(initialState);
    this.fetchOweTypes();
  }

  public readonly vm = this.selectSignal(s => s);

  private setLoading = this.updater((state) => ({ ...state, isLoading: true, error: undefined }));
  private setError = this.updater((state, error: string) => ({ ...state, isLoading: false, error }));

  readonly fetchOweTypes = this.effect<FetchOweTypesParams | void>(params$ =>
    params$.pipe(
      tap(() => this.setLoading()),
      switchMap((params) =>
        this.oweTypeService.fetchOweTypes(params || undefined).pipe(
          tapResponse({
            next: (oweTypes) => {
              this.patchState({ oweTypes, isLoading: false });
              this._result$.next({ action: 'fetch', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to load owe types');
              this._result$.next({ action: 'fetch', result: 'fail' });
            }
          })
        )
      )
    )
  );

  readonly createOweType = this.effect<CreateOweTypeDto>(oweType$ =>
    oweType$.pipe(
      switchMap(oweType =>
        this.oweTypeService.createOweType(oweType).pipe(
          tapResponse({
            next: () => {
              this.fetchOweTypes();
              this._result$.next({ action: 'create', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to create owe type');
              this._result$.next({ action: 'create', result: 'fail' });
            }
          })
        )
      )
    )
  );

  readonly updateOweType = this.effect<{ id: number; changes: CreateOweTypeDto }>(params$ =>
    params$.pipe(
      switchMap(({ id, changes }) =>
        this.oweTypeService.updateOweType(id, changes).pipe(
          tapResponse({
            next: () => {
              this.fetchOweTypes(); // Refresh the list
              this._result$.next({ action: 'update', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to update owe type');
              this._result$.next({ action: 'update', result: 'fail' });
            }
          })
        )
      )
    )
  );

  readonly deleteOweType = this.effect<number>(id$ =>
    id$.pipe(
      switchMap(id =>
        this.oweTypeService.deleteOweType(id).pipe(
          tapResponse({
            next: () => {
              this.fetchOweTypes(); // Refresh the list
              this._result$.next({ action: 'delete', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to delete owe type');
              this._result$.next({ action: 'delete', result: 'fail' });
            }
          })
        )
      )
    )
  );

  readonly fetchOwesByFinancialYear = this.effect<number>(finYear$ =>
    finYear$.pipe(
      tap(() => this.setLoading()),
      switchMap(finYear =>
        this.oweTypeService.getOwesByFinancialYear(finYear).pipe(
          tapResponse({
            next: (owesByFinancialYear) => {
              this.patchState({ owesByFinancialYear, isLoading: false });
              this._result$.next({ action: 'fetch_by_year', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to load owes by financial year');
              this._result$.next({ action: 'fetch_by_year', result: 'fail' });
            }
          })
        )
      )
    )
  );
}
