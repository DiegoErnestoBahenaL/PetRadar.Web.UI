import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ReportsHttpService } from '../heatmap/reports-http.service';
import { ReportViewModel } from '../heatmap/report.model';

@Component({
  selector: 'app-report-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './report-detail-page.component.html',
  styleUrl: './report-detail-page.component.scss',
})
export class ReportDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reportsService = inject(ReportsHttpService);
  private readonly destroyRef = inject(DestroyRef);

  report: ReportViewModel | null = null;
  isLoading = true;
  loadError = '';

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const id = Number(params.get('id'));
          if (!id || Number.isNaN(id)) {
            throw new Error('ID de reporte inválido');
          }
          this.isLoading = true;
          this.loadError = '';
          return this.reportsService.getReportById(id);
        })
      )
      .subscribe({
        next: (report) => {
          this.report = report;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando detalle del reporte', error);
          this.loadError = 'No fue posible cargar el detalle del reporte.';
          this.isLoading = false;
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/app/heatmap']);
  }

  formatDate(value?: string | null): string {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleString('es-MX');
  }

  getValue(value?: string | number | boolean | null): string {
    if (value === null || value === undefined || value === '') return 'N/D';
    return String(value);
  }

  getLocation(): string {
    if (!this.report) return 'N/D';

    if (this.report.addressText?.trim()) {
      return this.report.addressText;
    }

    if (this.report.latitude != null && this.report.longitude != null) {
      return `${Number(this.report.latitude).toFixed(5)}, ${Number(this.report.longitude).toFixed(5)}`;
    }

    return 'N/D';
  }

  getReportTypeLabel(value?: string | null): string {
    switch (value) {
      case 'Lost': return 'Perdido';
      case 'Found': return 'Encontrado';
      case 'Stray': return 'Callejero';
      default: return value || 'N/D';
    }
  }

  getReportStatusLabel(value?: string | null): string {
    switch (value) {
      case 'Active': return 'Activo';
      case 'Resolved': return 'Resuelto';
      case 'Adopted': return 'Adoptado';
      case 'Cancelled': return 'Cancelado';
      default: return value || 'N/D';
    }
  }
}