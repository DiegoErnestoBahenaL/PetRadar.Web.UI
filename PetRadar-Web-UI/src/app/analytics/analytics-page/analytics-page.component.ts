import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ReportsHttpService } from '../../heatmap/reports-http.service';
import { ReportViewModel } from '../../heatmap/report.model';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.css'
})
export class AnalyticsPageComponent implements OnInit {
  private readonly reportsService = inject(ReportsHttpService);

  reports: ReportViewModel[] = [];
  filteredReports: ReportViewModel[] = [];

  loading = false;
  errorMessage = '';

  totalReports = 0;
  activeReports = 0;
  recoveredReports = 0;
  sightingReports = 0;
  lostReports = 0;
  recoveryRate = 0;
  responseTimeMs = 0;
  availabilityStatus = 'Sin medir';
  availabilityPercentage = 0;
  analyticsErrors = 0;

  readonly responseTimeObjectiveMs = 1500;
  readonly availabilityObjective = 99;

  statusDistribution: { label: string; value: number; percentage: number }[] = [];
  speciesDistribution: { label: string; value: number; percentage: number }[] = [];
  monthlyTrend: { label: string; value: number; percentage: number }[] = [];
  zoneDistribution: { label: string; value: number; percentage: number }[] = [];

  selectedStatus = '';
  selectedType = '';
  selectedSpecies = '';
  selectedStartDate = '';
  selectedEndDate = '';

  ngOnInit(): void {
    this.loadReports();
  }

  
 private loadReports(): void {
  this.loading = true;
  this.errorMessage = '';

  const startTime = performance.now();

  this.reportsService.getReports().subscribe({
    next: (reports) => {
      const endTime = performance.now();

      this.responseTimeMs = Math.round(endTime - startTime);
      this.availabilityStatus = 'Disponible';
      this.availabilityPercentage = 100;

      this.reports = reports ?? [];
      this.filteredReports = [...this.reports];

      this.calculateKpis();
      this.calculateDistributions();

      this.loading = false;
    },
    error: () => {
      const endTime = performance.now();

      this.responseTimeMs = Math.round(endTime - startTime);
      this.availabilityStatus = 'No disponible';
      this.availabilityPercentage = 0;
      this.analyticsErrors++;

      this.errorMessage = 'No fue posible cargar la información de reportes.';
      this.loading = false;
    }
  });
}

  applyFilters(): void {
    this.filteredReports = this.reports.filter(report => {
      const matchesStatus = !this.selectedStatus || report.reportStatus === this.selectedStatus;
      const matchesType = !this.selectedType || report.reportType === this.selectedType;
      const matchesSpecies = !this.selectedSpecies || report.species === this.selectedSpecies;

      const reportDate = report.incidentDate ? new Date(report.incidentDate) : null;
      const startDate = this.selectedStartDate ? new Date(this.selectedStartDate) : null;
      const endDate = this.selectedEndDate ? new Date(this.selectedEndDate) : null;

      const matchesStartDate = !startDate || (reportDate !== null && reportDate >= startDate);
      const matchesEndDate = !endDate || (reportDate !== null && reportDate <= endDate);

      return matchesStatus &&
        matchesType &&
        matchesSpecies &&
        matchesStartDate &&
        matchesEndDate;
    });

    this.calculateKpis();
    this.calculateDistributions();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedType = '';
    this.selectedSpecies = '';
    this.selectedStartDate = '';
    this.selectedEndDate = '';

    this.filteredReports = [...this.reports];

    this.calculateKpis();
    this.calculateDistributions();
  }

  private calculateDistributions(): void {
    this.statusDistribution = this.buildDistribution(this.filteredReports, 'reportStatus');
    this.speciesDistribution = this.buildDistribution(this.filteredReports, 'species');
    this.monthlyTrend = this.buildMonthlyTrend(this.filteredReports);
    this.zoneDistribution = this.buildZoneDistribution(this.filteredReports);
  }

  private buildMonthlyTrend(
    reports: ReportViewModel[]
  ): { label: string; value: number; percentage: number }[] {
    const validReports = reports.filter(report => !!report.incidentDate);
    const total = validReports.length;

    if (total === 0) {
      return [];
    }

    const counts = validReports.reduce<Record<string, number>>((acc, report) => {
      const date = new Date(report.incidentDate!);

      if (Number.isNaN(date.getTime())) {
        return acc;
      }

      const label = date.toLocaleDateString('es-MX', {
        month: 'short',
        year: 'numeric'
      });

      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value,
        percentage: Math.round((value / total) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  }

  private buildZoneDistribution(
    reports: ReportViewModel[]
  ): { label: string; value: number; percentage: number }[] {
    const validReports = reports.filter(report => !!report.addressText);
    const total = validReports.length;

    if (total === 0) {
      return [];
    }

    const counts = validReports.reduce<Record<string, number>>((acc, report) => {
      const label = this.extractZoneLabel(report.addressText);

      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value,
        percentage: Math.round((value / total) * 100)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }

  private extractZoneLabel(address?: string | null): string {
    if (!address) {
      return 'Sin zona';
    }

    const parts = address
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  }

  exportToCsv(): void {
    const generatedAt = new Date().toLocaleString('es-MX');

    const rows: (string | number | null | undefined)[][] = [
      ['REPORTE ANALÍTICO PETRADAR'],
      ['Fecha de generación', generatedAt],
      ['Total de reportes filtrados', this.totalReports],
      ['Reportes activos', this.activeReports],
      ['Mascotas recuperadas', this.recoveredReports],
      ['Avistamientos', this.sightingReports],
      ['Mascotas perdidas', this.lostReports],
      ['Tasa de recuperación', `${this.recoveryRate}%`],
      ['Tiempo de respuesta API', `${this.responseTimeMs} ms`],
      ['Disponibilidad consulta', `${this.availabilityPercentage}%`],
      ['Errores de carga sesión', this.analyticsErrors],
      [],
      ['FILTROS APLICADOS'],
      ['Estado', this.selectedStatus || 'Todos'],
      ['Tipo de reporte', this.selectedType || 'Todos'],
      ['Especie', this.selectedSpecies || 'Todas'],
      ['Fecha inicial', this.selectedStartDate || 'Sin filtro'],
      ['Fecha final', this.selectedEndDate || 'Sin filtro'],
      [],
      ['DISTRIBUCIÓN POR ESTADO'],
      ['Estado', 'Cantidad', 'Porcentaje'],
      ...this.statusDistribution.map(item => [
        this.getStatusLabel(item.label),
        item.value,
        `${item.percentage}%`
      ]),
      [],
      ['DISTRIBUCIÓN POR ESPECIE'],
      ['Especie', 'Cantidad', 'Porcentaje'],
      ...this.speciesDistribution.map(item => [
        this.getSpeciesLabel(item.label),
        item.value,
        `${item.percentage}%`
      ]),
      [],
      ['TENDENCIA TEMPORAL'],
      ['Periodo', 'Cantidad', 'Porcentaje'],
      ...this.monthlyTrend.map(item => [
        item.label,
        item.value,
        `${item.percentage}%`
      ]),
      [],
      ['TOP ZONAS'],
      ['Zona', 'Cantidad', 'Porcentaje'],
      ...this.zoneDistribution.map(item => [
        item.label,
        item.value,
        `${item.percentage}%`
      ]),
      [],
      ['DETALLE DE REPORTES'],
      [
        'ID',
        'Tipo de reporte',
        'Especie',
        'Estado',
        'Fecha incidente',
        'Ubicación textual',
        'Latitud',
        'Longitud'
      ],
      ...this.filteredReports.map(report => [
        report.id,
        report.reportType,
        report.species,
        report.reportStatus,
        report.incidentDate ?? '',
        report.addressText ?? '',
        report.latitude ?? '',
        report.longitude ?? ''
      ])
    ];

    const csvContent = rows
      .map(row =>
        row
          .map(value => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `petradar-reporte-analitico-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  private buildDistribution(
    reports: ReportViewModel[],
    key: keyof ReportViewModel
  ): { label: string; value: number; percentage: number }[] {
    const total = reports.length;

    if (total === 0) {
      return [];
    }

    const counts = reports.reduce<Record<string, number>>((acc, report) => {
      const rawValue = report[key];
      const label = rawValue ? String(rawValue) : 'Sin dato';

      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value,
        percentage: Math.round((value / total) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Active: 'Activo',
      Resolved: 'Resuelto',
      Recovered: 'Recuperado',
      Cancelled: 'Cancelado'
    };

    return labels[status] ?? status;
  }

  getSpeciesLabel(species: string): string {
    const labels: Record<string, string> = {
      Dog: 'Perro',
      Cat: 'Gato'
    };

    return labels[species] ?? species;
  }


  private calculateKpis(): void {
    const base = this.filteredReports;

    this.totalReports = base.length;

    this.activeReports = base.filter(r => r.reportStatus === 'Active').length;

    this.recoveredReports = base.filter(
      r => r.reportStatus === 'Resolved' || r.reportStatus === 'Recovered'
    ).length;

    this.sightingReports = base.filter(
      r => r.reportType === 'Found' || r.reportType === 'Stray'
    ).length;

    this.lostReports = base.filter(r => r.reportType === 'Lost').length;

    this.recoveryRate = this.lostReports > 0
      ? Math.round((this.recoveredReports / this.lostReports) * 100)
      : 0;
  }

  getResponseTimeStatus(): string {
    return this.responseTimeMs <= this.responseTimeObjectiveMs
      ? 'Dentro del objetivo'
      : 'Fuera del objetivo';
  }

  getAvailabilityStatus(): string {
    return this.availabilityPercentage >= this.availabilityObjective
      ? 'Dentro del objetivo'
      : 'Fuera del objetivo';
  }
}