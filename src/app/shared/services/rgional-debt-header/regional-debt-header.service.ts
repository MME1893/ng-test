import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SubmitDebtPayload } from '../../models/regional-debt-header.model';

@Injectable({
  providedIn: 'root'
})
export class RegionalDebtHeaderService {
  private http = inject(HttpClient);
  private readonly regionalDebtApi = environment.endpoints.regionalDebtHeader;

  submitDebt(payload: SubmitDebtPayload): Observable<string> {
    return this.http.post<string>(this.regionalDebtApi.submitDebt, payload);
  }

  /*
  fetchHeaders(): Observable<any[]> {
    return this.http.get<any[]>(this.regionalDebtApi.root);
  }

  deleteHeader(id: number): Observable<void> {
    return this.http.delete<void>(this.regionalDebtApi.detail(id));
  }
  */

}
