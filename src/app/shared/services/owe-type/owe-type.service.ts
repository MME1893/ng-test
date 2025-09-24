import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  OweType,
  CreateOweTypeDto,
  OweByFinancialYear,
  FetchOweTypesParams
} from '../../models/owe-type.model';

@Injectable({
  providedIn: 'root'
})
export class OweTypeService {
  private http = inject(HttpClient);
  private readonly oweTypeApi = environment.endpoints.oweType;

  fetchOweTypes(params?: FetchOweTypesParams): Observable<OweType[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<OweType[]>(this.oweTypeApi.root, { params: httpParams });
  }

  getOweType(id: number): Observable<OweType> {
    return this.http.get<OweType>(this.oweTypeApi.detail(id));
  }

  createOweType(payload: CreateOweTypeDto): Observable<OweType> {
    return this.http.post<OweType>(this.oweTypeApi.root, payload);
  }

  updateOweType(id: number, payload: CreateOweTypeDto): Observable<OweType> {
    return this.http.put<OweType>(this.oweTypeApi.detail(id), payload);
  }

  deleteOweType(id: number): Observable<void> {
    return this.http.delete<void>(this.oweTypeApi.detail(id));
  }

  getOwesByFinancialYear(finYear: number): Observable<OweByFinancialYear> {
    return this.http.get<OweByFinancialYear>(this.oweTypeApi.byFinancialYear(finYear));
  }
}
