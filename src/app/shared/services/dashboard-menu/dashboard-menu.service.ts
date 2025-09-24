import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { dynamicMenuItem } from '../../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardMenuService {
  private readonly menuApi = environment.endpoints.menuItems;
  constructor(private readonly http: HttpClient) {
  }

  getDynamicMenuItems(fYear: number): Observable<dynamicMenuItem[]> {
    return this.http.get<dynamicMenuItem[]>(this.menuApi(fYear))
  }
}

