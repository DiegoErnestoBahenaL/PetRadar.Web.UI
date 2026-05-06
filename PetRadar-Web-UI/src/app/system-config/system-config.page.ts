import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SystemConfigService, SystemConfigs } from './system-config.service';

@Component({
  selector: 'app-system-config-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-config.page.html',
  styleUrl: './system-config.page.scss',
})
export class SystemConfigPageComponent {
  private service = inject(SystemConfigService);

  configs: SystemConfigs = {
    yoloConfThreshold: null,
    topKBreedPredictions: null,
    topKBreedPredictionThreshold: null,
  };

  isLoading = false;
  isSaving = false;
  message = '';
  error = '';

  ngOnInit(): void {
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.isLoading = true;
    this.error = '';

    this.service.getConfigs().subscribe({
      next: (data) => {
        this.configs = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar las configuraciones.';
        this.isLoading = false;
      },
    });
  }

  save(): void {
    this.isSaving = true;
    this.message = '';
    this.error = '';

    this.service.updateConfigs(this.configs).subscribe({
      next: () => {
        this.message = 'Configuraciones guardadas correctamente.';
        this.isSaving = false;
      },
      error: () => {
        this.error = 'No fue posible guardar las configuraciones.';
        this.isSaving = false;
      },
    });
  }

  downloadImagesBackup(): void {
    this.downloadZip(this.service.downloadImagesBackup(), 'respaldo-imagenes.zip');
  }

  downloadDbBackup(): void {
    this.downloadZip(this.service.downloadDbBackup(), 'respaldo-base-datos.zip');
  }

  private downloadZip(request: any, fileName: string): void {
    request.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error = `No fue posible descargar ${fileName}.`;
      },
    });
  }
}