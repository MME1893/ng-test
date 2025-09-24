import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FinancialYear } from '../../models/financial-year.model';

@Injectable({
  providedIn: 'root'
})
export class FinancialYearService {
  private readonly apiUrl = environment.endpoints.financialYear;

  constructor(private http: HttpClient) { }

  getAll(): Observable<FinancialYear[]> {
    return this.http.get<FinancialYear[]>(this.apiUrl);
  }

  add(year: number): Observable<FinancialYear> {
    return this.http.post<FinancialYear>(this.apiUrl, { year });
  }

  delete(year: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${year}/`);
  }
}
