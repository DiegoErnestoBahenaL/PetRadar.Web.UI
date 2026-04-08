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
import * as L from 'leaflet';
import 'leaflet.heat';
import { ReportsHttpService } from './reports-http.service';
import { ReportViewModel } from './report.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type HeatPoint = [number, number, number];

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

  private map!: L.Map;
  private heatLayer: any;

  reports: ReportViewModel[] = [];
  filteredReports: ReportViewModel[] = [];

  filters = {
    species: '',
    reportType: '',
    reportStatus: '',
    startDate: '',
    endDate: '',
    radius: 25,
    intensity: 0.8,
  };

  ngAfterViewInit(): void {
    this.initMap();
    this.loadReports();
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

  private loadReports(): void {
    this.reportsService
      .getReports()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.reports = data ?? [];
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error al cargar reportes', err);
        },
      });
  }

  applyFilters(): void {
    this.filteredReports = this.reports.filter((report) => {
      if (report.latitude == null || report.longitude == null) return false;

      if (this.filters.species &&
          (report.species ?? '').toLowerCase() !== this.filters.species.toLowerCase()) {
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

    if (this.heatLayer) {
        this.map.removeLayer(this.heatLayer);
    }

    const heatPoints: [number, number, number][] = this.filteredReports.map((report) => [
        report.latitude as number,
        report.longitude as number,
        this.filters.intensity,
    ]);

    if (!heatPoints.length) {
        return;
    }

    this.heatLayer = (L as any).heatLayer(heatPoints, {
        radius: this.filters.radius,
        blur: 18,
        maxZoom: 17,
        minOpacity: Math.max(0.15, this.filters.intensity / 3),
    });

    this.heatLayer.addTo(this.map);
  }
}