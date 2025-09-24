import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Region } from '../../models/region.model';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private readonly regionApi = environment.endpoints.region;
  constructor(private readonly http: HttpClient) { }

  fetchRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(this.regionApi.root);
  }

  getRegion(id: number): Observable<Region> {
    return this.http.get<Region>(this.regionApi.detail(id));
  }

  createRegion(payload: Region): Observable<Region> {
    return this.http.post<Region>(this.regionApi.root, payload);
  }

  updateRegion(id: number, payload: Region): Observable<Region> {
    return this.http.put<Region>(this.regionApi.detail(id), payload);
  }

  deleteRegion(id: number): Observable<void> {
    return this.http.delete<void>(this.regionApi.detail(id));
  }

  uploadRegionFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(this.regionApi.uploadFile, formData);
  }
}
