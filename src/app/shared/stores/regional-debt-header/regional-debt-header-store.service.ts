import { Injectable } from '@angular/core';
import { RegionalDebtState, SubmitDebtPayload } from '../../models/regional-debt-header.model';
import { Subject, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ComponentStore } from '@ngrx/component-store';
import { RegionalDebtHeaderService } from '../../services/rgional-debt-header/regional-debt-header.service';

const initialState: RegionalDebtState = {
  isLoading: false,
  error: undefined,
};

@Injectable({
  providedIn: 'root'
})
export class RegionalDebtHeaderStore extends ComponentStore<RegionalDebtState> {
  private readonly _result$ = new Subject<{ action: 'submit_debt', result: 'success' | 'fail' }>();
  public readonly result$ = this._result$.asObservable();

  constructor(private readonly regionalDebtService: RegionalDebtHeaderService) {
    super(initialState);
  }

  public readonly vm = this.selectSignal(s => s);

  private setLoading = this.updater((state) => ({ ...state, isLoading: true, error: undefined }));
  private setError = this.updater((state, error: string) => ({ ...state, isLoading: false, error }));
  private setSuccess = this.updater((state) => ({ ...state, isLoading: false, error: undefined }));

  readonly submitDebt = this.effect<SubmitDebtPayload>(payload$ =>
    payload$.pipe(
      tap(() => this.setLoading()),
      switchMap(payload =>
        this.regionalDebtService.submitDebt(payload).pipe(
          tapResponse({
            next: () => {
              this.setSuccess();
              this._result$.next({ action: 'submit_debt', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to submit debt');
              this._result$.next({ action: 'submit_debt', result: 'fail' });
            },
          })
        )
      )
    )
  );
}
