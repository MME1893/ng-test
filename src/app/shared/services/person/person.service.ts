import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Person, CreatePersonDto } from '../../models/person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private http = inject(HttpClient);

  private readonly personApi = environment.endpoints.person;

  fetchPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.personApi);
  }

  createPerson(payload: CreatePersonDto): Observable<Person> {
    return this.http.post<Person>(this.personApi, payload);
  }

  // getPerson(id: number): Observable<Person> {
  //   return this.http.get<Person>(this.personApi.detail(id));
  // }

  // updatePerson(id: number, payload: Partial<CreatePersonDto>): Observable<Person> {
  //   return this.http.put<Person>(this.personApi.detail(id), payload);
  // }

  // deletePerson(id: number): Observable<void> {
  //   return this.http.delete<void>(this.personApi.detail(id));
  // }
}
