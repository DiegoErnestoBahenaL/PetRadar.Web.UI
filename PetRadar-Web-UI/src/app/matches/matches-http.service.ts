import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface MatchReportSummary {
  id?: number | null;
  species?: string | null;
  breed?: string | null;
  color?: string | null;
  reportStatus?: string | null;
  reportType?: string | null;
}

export interface MatchViewModel {
  id?: number | null;
  lostReport?: MatchReportSummary | null;
  strayReport?: MatchReportSummary | null;
  score?: number | null;
  distanceInKM?: number | null;
  status?: string | null;
  notes?: string | null;
  confirmationDate?: string | null;
}

@Injectable({ providedIn: 'root' })
export class MatchesHttpService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://api-qa.petradar-qa.org';

  getMatches(): Observable<MatchViewModel[]> {
    return this.http.get<MatchViewModel[]>(`${this.baseUrl}/api/Matches`);
  }

updateMatchStatus(
  id: number,
  status: 'Pending' | 'Confirmed' | 'Dismissed'
 ): Observable<void> {
  return this.http.put<void>(`${this.baseUrl}/api/Matches/${id}`, {
    status,
  });
 }

 deleteMatch(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/api/Matches/${id}`);
}


}