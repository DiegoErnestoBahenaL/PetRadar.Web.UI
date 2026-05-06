import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface SystemConfigs {
  yoloConfThreshold: number | null;
  topKBreedPredictions: number | null;
  topKBreedPredictionThreshold: number | null;
}

@Injectable({ providedIn: 'root' })
export class SystemConfigService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://api-qa.petradar-qa.org';

  getConfigs() {
    return this.http.get<SystemConfigs>(`${this.baseUrl}/api/SystemConfig/configs`);
  }

  updateConfigs(payload: SystemConfigs) {
    return this.http.put<void>(`${this.baseUrl}/api/SystemConfig/configs`, payload);
  }

  downloadImagesBackup() {
    return this.http.get(`${this.baseUrl}/api/SystemConfig/imagesbackup`, {
      responseType: 'blob',
    });
  }

  downloadDbBackup() {
    return this.http.get(`${this.baseUrl}/api/SystemConfig/dbbackup`, {
      responseType: 'blob',
    });
  }
}
