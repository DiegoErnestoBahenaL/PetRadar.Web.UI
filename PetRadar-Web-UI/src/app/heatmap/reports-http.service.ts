import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportViewModel } from './report.model';

type ReportStatus = 'Active' | 'Resolved' | 'Adopted' | 'Cancelled';

interface ReportUpdatePayload {
  reportStatus: ReportStatus;
}

@Injectable({ providedIn: 'root' })
export class ReportsHttpService {
  private http = inject(HttpClient);

  private readonly baseUrl = 'https://api-qa.petradar-qa.org';

  getReports(): Observable<ReportViewModel[]> {
    return this.http.get<ReportViewModel[]>(`${this.baseUrl}/api/Reports`);
  }

  getReportById(id: number): Observable<ReportViewModel> {
    return this.http.get<ReportViewModel>(`${this.baseUrl}/api/Reports/${id}`);
  }

  updateReportStatus(id: number, reportStatus: ReportStatus): Observable<void> {
    const payload: ReportUpdatePayload = { reportStatus };
    return this.http.put<void>(`${this.baseUrl}/api/Reports/${id}`, payload);
  }
}