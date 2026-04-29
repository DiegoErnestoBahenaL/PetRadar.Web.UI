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

  getReportMainPicture(reportId: number) {
    return this.http.get(
      `${this.baseUrl}/api/Reports/${reportId}/mainpicture`,
      { responseType: 'blob' }
    );
  }

  getReportAdditionalPhotos(reportId: number) {
    return this.http.get<string[]>(
      `${this.baseUrl}/api/Reports/${reportId}/additionalphotos`
    );
  }

  getReportAdditionalPhoto(reportId: number, photoName: string) {
    return this.http.get(
      `${this.baseUrl}/api/Reports/${reportId}/additionalphotos/${photoName}`,
      { responseType: 'blob' }
    );
  }
}