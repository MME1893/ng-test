import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { CreatePersonDto, PersonState } from '../../models/person.model';
import { Subject, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { PersonService } from '../../services/person/person.service';

const initialState: PersonState = { persons: [], isLoading: false, error: undefined };


@Injectable({
  providedIn: 'root'
})
export class PersonStore extends ComponentStore<PersonState> {

  private readonly _result$ = new Subject<{ action: 'delete' | 'edit' | 'create' | 'fetch', result: 'success' | 'fail' }>();
  public readonly result$ = this._result$.asObservable();

  constructor(private readonly personService: PersonService) {
    super(initialState);
    this.fetchPersons();
  }

  public readonly vm = this.selectSignal(s => s);

  private setLoading = this.updater((state) => ({ ...state, isLoading: true, error: undefined }));
  private setError = this.updater((state, error: string) => ({ ...state, isLoading: false, error }));

  readonly fetchPersons = this.effect<void>(trigger$ =>
    trigger$.pipe(
      tap(() => this.setLoading()),
      switchMap(() =>
        this.personService.fetchPersons().pipe(
          tapResponse({
            next: (persons) => {
              this.patchState({ persons, isLoading: false });
              this._result$.next({ action: 'fetch', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to load persons');
              this._result$.next({ action: 'fetch', result: 'fail' });
            }
          })
        )
      )
    )
  );

  readonly createPerson = this.effect<CreatePersonDto>(person$ =>
    person$.pipe(
      switchMap(person =>
        this.personService.createPerson(person).pipe(
          tapResponse({
            next: () => {
              this.fetchPersons();
              this._result$.next({ action: 'create', result: 'success' });
            },
            error: (err: Error) => {
              this.setError(err.message || 'Failed to create person');
              this._result$.next({ action: 'create', result: 'fail' });
            }
          })
        )
      )
    )
  );

  // readonly updatePerson = this.effect<{ id: number; changes: Partial<CreatePersonDto> }>(params$ =>
  //   params$.pipe(
  //     switchMap(({ id, changes }) =>
  //       this.personService.updatePerson(id, changes).pipe(
  //         tapResponse({
  //           next: () => {
  //             this.fetchPersons();
  //             this._result$.next({ action: 'edit', result: 'success' });
  //           },
  //           error: (err: Error) => {
  //             this.setError(err.message || 'Failed to update person');
  //             this._result$.next({ action: 'edit', result: 'fail' });
  //           }
  //         })
  //       )
  //     )
  //   )
  // );

  // readonly deletePerson = this.effect<number>(id$ =>
  //   id$.pipe(
  //     switchMap(id =>
  //       this.personService.deletePerson(id).pipe(
  //         tapResponse({
  //           next: () => {
  //             this.fetchPersons();
  //             this._result$.next({ action: 'delete', result: 'success' });
  //           },
  //           error: (err: Error) => {
  //             this.setError(err.message || 'Failed to delete person');
  //             this._result$.next({ action: 'delete', result: 'fail' });
  //           }
  //         })
  //       )
  //     )
  //   )
  // );
}
