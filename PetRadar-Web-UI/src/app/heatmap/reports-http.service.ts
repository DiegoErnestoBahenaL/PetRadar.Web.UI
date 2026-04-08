import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportViewModel } from './report.model';

@Injectable({ providedIn: 'root' })
export class ReportsHttpService {
  private http = inject(HttpClient);

  // Ajusta esto si ya usan environment.apiUrl
  private readonly baseUrl = 'https://api-qa.petradar-qa.org';

  getReports(): Observable<ReportViewModel[]> {
    return this.http.get<ReportViewModel[]>(`${this.baseUrl}/api/Reports`);
  }
}