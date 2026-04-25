import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { ReportsHttpService } from './reports-http.service';
import { ReportViewModel } from './report.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-heatmap-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './heatmap.page.html',
  styleUrl: './heatmap.page.scss',
})
export class HeatmapPageComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private reportsService = inject(ReportsHttpService);
  private destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  private map!: L.Map;
  private heatLayer: any;
  private markersLayer?: L.LayerGroup;

  reports: ReportViewModel[] = [];
  filteredReports: ReportViewModel[] = [];
  selectedReportId: number | null = null;

  loadError = '';
  isLoading = false;

  updatingReportId: number | null = null;
  statusActionError = '';

  filters = {
    species: '',
    reportType: '',
    reportStatus: '',
    startDate: '',
    endDate: '',
    radius: 25,
    intensity: 0.8,
  };

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.ensureHeatPluginLoaded();
      this.initMap();
      this.loadReports();
    } catch (error) {
      console.error('No se pudo cargar leaflet.heat', error);
      this.loadError = 'No fue posible inicializar el plugin del mapa de calor.';
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [20.6736, -103.344],
      zoom: 11,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private async ensureHeatPluginLoaded(): Promise<void> {
    const leafletAny = L as any;

    if (typeof leafletAny.heatLayer === 'function') {
      return;
    }

    (window as any).L = L;
    await import('leaflet.heat');

    if (typeof leafletAny.heatLayer !== 'function') {
      throw new Error('leaflet.heat no se cargó correctamente');
    }
  }

  private loadReports(): void {
    this.isLoading = true;
    this.loadError = '';

    this.reportsService
      .getReports()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.reports = data ?? [];
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar reportes', err);
          this.loadError = 'No fue posible cargar los reportes.';
          this.isLoading = false;
        },
      });
  }

  applyFilters(): void {
    this.filteredReports = this.reports.filter((report) => {
      if (report.latitude == null || report.longitude == null) return false;

      if (
        this.filters.species &&
        (report.species ?? '').toLowerCase() !== this.filters.species.toLowerCase()
      ) {
        return false;
      }

      if (this.filters.reportType && report.reportType !== this.filters.reportType) {
        return false;
      }

      if (this.filters.reportStatus && report.reportStatus !== this.filters.reportStatus) {
        return false;
      }

      if (this.filters.startDate && report.incidentDate) {
        const reportDate = new Date(report.incidentDate);
        const start = new Date(this.filters.startDate);
        if (reportDate < start) return false;
      }

      if (this.filters.endDate && report.incidentDate) {
        const reportDate = new Date(report.incidentDate);
        const end = new Date(this.filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (reportDate > end) return false;
      }

      return true;
    });

    this.renderHeatmap();
  }

  onHeatmapSettingChange(): void {
    if (!this.reports.length) {
      return;
    }

    this.renderHeatmap();
  }

  private renderHeatmap(): void {
    if (!this.map) return;

    const leafletAny = L as any;

    if (typeof leafletAny.heatLayer !== 'function') {
      console.error('leaflet.heat no disponible en runtime');
      this.loadError = 'El plugin de mapa de calor no está disponible en este entorno.';
      return;
    }

    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
      this.heatLayer = undefined;
    }

    if (this.markersLayer) {
      this.map.removeLayer(this.markersLayer);
      this.markersLayer = undefined;
    }

    const heatPoints: [number, number, number][] = this.filteredReports.map((report) => [
      Number(report.latitude),
      Number(report.longitude),
      this.filters.intensity,
    ]);

    if (!heatPoints.length) return;

    this.heatLayer = leafletAny.heatLayer(heatPoints, {
      radius: this.filters.radius,
      blur: 18,
      maxZoom: 17,
      minOpacity: Math.max(0.15, this.filters.intensity / 3),
    });

    this.heatLayer.addTo(this.map);
    this.renderMarkers();
  }

  formatDate(value?: string | null): string {
    if (!value) return 'Sin fecha';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';

    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  getShortLocation(report: ReportViewModel): string {
    if (report.addressText && report.addressText.trim()) {
      return report.addressText;
    }

    if (report.latitude != null && report.longitude != null) {
      return `${Number(report.latitude).toFixed(4)}, ${Number(report.longitude).toFixed(4)}`;
    }

    return 'Sin ubicación';
  }

  openReportDetail(report: ReportViewModel, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['/app/reports', report.id]);
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

  getReportStatusBadgeClass(value?: string | null): string {
    switch (value) {
      case 'Active':
        return 'text-bg-success';
      case 'Cancelled':
        return 'text-bg-danger';
      case 'Resolved':
        return 'text-bg-primary';
      case 'Adopted':
        return 'text-bg-warning';
      default:
        return 'text-bg-secondary';
    }
  }

  getNextStatus(report: ReportViewModel): 'Active' | 'Cancelled' | null {
    if (report.reportStatus === 'Active') return 'Cancelled';
    if (report.reportStatus === 'Cancelled') return 'Active';
    return null;
  }

  getStatusActionLabel(report: ReportViewModel): string {
    const nextStatus = this.getNextStatus(report);
    if (nextStatus === 'Cancelled') return 'Cancelar';
    if (nextStatus === 'Active') return 'Activar';
    return 'Sin acción';
  }

  canToggleStatus(report: ReportViewModel): boolean {
    return this.getNextStatus(report) !== null;
  }

  toggleReportStatus(report: ReportViewModel, event: Event): void {
    event.stopPropagation();
    this.statusActionError = '';

    const nextStatus = this.getNextStatus(report);
    if (!nextStatus || report.id == null) {
      return;
    }

    const currentLabel = this.getReportStatusLabel(report.reportStatus);
    const nextLabel = this.getReportStatusLabel(nextStatus);

    const confirmed = window.confirm(
      `¿Deseas cambiar el estado del reporte #${report.id} de "${currentLabel}" a "${nextLabel}"?`
    );

    if (!confirmed) {
      return;
    }

    this.updatingReportId = report.id;

    this.reportsService
      .updateReportStatus(report.id, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          report.reportStatus = nextStatus;
          this.updatingReportId = null;
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error al actualizar estado del reporte', err);
          this.statusActionError = `No fue posible actualizar el estado del reporte #${report.id}.`;
          this.updatingReportId = null;
        },
      });
  }

  onReportSelected(report: ReportViewModel): void {
    this.selectedReportId = report.id;

    if (report.latitude && report.longitude) {
      this.map.setView([report.latitude, report.longitude], 14);
    }
  }

  private renderMarkers(): void {
    if (!this.map) return;

    if (this.markersLayer) {
      this.map.removeLayer(this.markersLayer);
    }

    this.markersLayer = L.layerGroup();

    this.filteredReports.forEach((report) => {
      if (report.latitude == null || report.longitude == null) return;

      const marker = L.circleMarker(
        [report.latitude, report.longitude],
        {
          radius: 6,
          color: '#007bff',
          fillColor: '#007bff',
          fillOpacity: 0.3,
        }
      );

      marker.on('click', () => {
        this.onReportSelected(report);
      });

      marker.bindTooltip(`
        <div class="report-tooltip">
          <div><strong>Reporte #${report.id}</strong></div>
          <div>Tipo: ${this.getReportTypeLabel(report.reportType)}</div>
          <div>Especie: ${report.species || 'N/D'}</div>
          <div>Estado: ${this.getReportStatusLabel(report.reportStatus)}</div>
          <div>Fecha: ${this.formatDate(report.incidentDate)}</div>
          <div>Ubicación: ${this.getShortLocation(report)}</div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -8],
        opacity: 0.95,
      });

      this.markersLayer!.addLayer(marker);
    });

    this.markersLayer.addTo(this.map);
  }

  openSelectedReportDetail(): void {
    if (!this.selectedReportId) return;
    this.router.navigate(['/app/reports', this.selectedReportId]);
  }

  getGoogleMapsUrl(report: ReportViewModel): string | null {
    if (report.latitude != null && report.longitude != null) {
      return `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
    }
    return null;
  }
} 