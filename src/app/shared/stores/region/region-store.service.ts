import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { switchMap, tap } from 'rxjs/operators';
import { Region, RegionState } from '../../models/region.model';
import { RegionService } from '../../services/region/region.service';
import { Subject } from 'rxjs';

const initialState: RegionState = { regions: [], isLoading: false, error: undefined };

@Injectable({
  providedIn: 'root'
})
export class RegionStore extends ComponentStore<RegionState> {
  private readonly _result$ = new Subject<{ action: 'delete' | 'edit' | 'create' | 'fetch' | 'upload', result: 'success' | 'fail' }>();
  public readonly result$ = this._result$.asObservable();

  constructor(private readonly regionService: RegionService) {
    super(initialState);
    this.fetchRegions();
  }

  public readonly vm = this.selectSignal(s => s);

  private setLoading = this.updater((state) => ({ ...state, isLoading: true, error: undefined }));
  private setError = this.updater((state, error: string) => ({ ...state, isLoading: false, error }));

  readonly fetchRegions = this.effect<void>(trigger$ =>
    trigger$.pipe(
      tap(() => this.setLoading()),
      switchMap(() =>
        this.regionService.fetchRegions().pipe(
          tapResponse({
            next: (regions) => {
              this.patchState({ regions, isLoading: false });
              this._result$.next({ action: 'fetch', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to load regions');
              this._result$.next({ action: 'fetch', result: 'fail' });
            }
          })
        )
      )
    )
  );

  readonly createRegion = this.effect<Region>(region$ =>
    region$.pipe(
      switchMap(region =>
        this.regionService.createRegion(region).pipe(
          tapResponse({
            next: () => {
              this.fetchRegions();
              this._result$.next({ action: 'create', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to create region');
              this._result$.next({ action: 'create', result: 'fail' });
            }
          })
        )
      )
    )
  );

  readonly updateRegion = this.effect<{ id: number; changes: Region }>(params$ =>
    params$.pipe(
      switchMap(({ id, changes }) =>
        this.regionService.updateRegion(id, changes).pipe(
          tapResponse({
            next: () => {
              this.fetchRegions();
              this._result$.next({ action: 'edit', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to update region');
              this._result$.next({ action: 'edit', result: 'fail' });
            }
          })
        )
      )
    )
  );

  readonly deleteRegion = this.effect<number>(id$ =>
    id$.pipe(
      switchMap(id =>
        this.regionService.deleteRegion(id).pipe(
          tapResponse({
            next: () => {
              this.fetchRegions();
              this._result$.next({ action: 'delete', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to delete region');
              this._result$.next({ action: 'delete', result: 'fail' });
            }
          })
        )
      )
    )
  );

  readonly uploadRegionFile = this.effect<File>(file$ =>
    file$.pipe(
      switchMap(file =>
        this.regionService.uploadRegionFile(file).pipe(
          tapResponse({
            next: () => {
              this.fetchRegions();
              this._result$.next({ action: 'upload', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to upload file');
              this._result$.next({ action: 'upload', result: 'fail' });
            }
          })
        )
      )
    )
  );
}