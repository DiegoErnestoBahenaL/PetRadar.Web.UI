import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ReportsHttpService } from '../../heatmap/reports-http.service';
import { ReportViewModel } from '../../heatmap/report.model';

import { Chart, ChartConfiguration, registerables } from 'chart.js';
import * as XLSX from 'xlsx-js-style';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.scss'  
})
export class AnalyticsPageComponent implements OnInit {
  private readonly reportsService = inject(ReportsHttpService);

  viewMode: 'summary' | 'charts' = 'summary';

  setViewMode(mode: 'summary' | 'charts'): void {
    this.viewMode = mode;

    if (mode === 'charts') {
      setTimeout(() => this.renderCharts(), 0);
    }
  }

  private charts: Chart[] = [];

  private renderCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    this.createChart('statusChart', {
      type: 'doughnut',
      data: {
        labels: this.statusDistribution.map(x => this.getStatusLabel(x.label)),
        datasets: [{ data: this.statusDistribution.map(x => x.value) }]
      }
    });

    this.createChart('speciesChart', {
      type: 'doughnut',
      data: {
        labels: this.speciesDistribution.map(x => this.getSpeciesLabel(x.label)),
        datasets: [{ data: this.speciesDistribution.map(x => x.value) }]
      }
    });

    this.createChart('monthlyTrendChart', {
      type: 'line',
      data: {
        labels: this.monthlyTrend.map(x => x.label),
        datasets: [{
          label: 'Reportes',
          data: this.monthlyTrend.map(x => x.value),
          tension: 0.35
        }]
      }
    });

    this.createChart('zoneChart', {
      type: 'bar',
      data: {
        labels: this.zoneDistribution.map(x => x.label),
        datasets: [{
          label: 'Reportes',
          data: this.zoneDistribution.map(x => x.value)
        }]
      },
      options: {
        indexAxis: 'y'
      }
    });
    this.createChart('dataQualityRadarChart', {
      type: 'radar',
      data: {
        labels: [
          'Foto',
          'Coordenadas',
          'Raza',
          'Color',
          'Collar',
          'Placa'
        ],
        datasets: [{
          label: 'Calidad de datos (%)',
          data: this.getDataQualityRadarValues()
        }]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    this.createChart('rewardViewsScatterChart', {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Reportes',
          data: this.getRewardViewsScatterData()
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Recompensa'
            },
            beginAtZero: true
          },
          y: {
            title: {
              display: true,
              text: 'Visualizaciones'
            },
            beginAtZero: true
          }
        }
      }
    });

    this.createChart('radiusViewsBubbleChart', {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Reportes',
          data: this.getRadiusViewsBubbleData()
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Radio de búsqueda (m)'
            },
            beginAtZero: true
          },
          y: {
            title: {
              display: true,
              text: 'Visualizaciones'
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  reportSearchTerm = '';
  reportPage = 1;
  reportPageSize = 10;
  reportPageSizeOptions = [5, 10, 25, 50];

  get searchedReports(): ReportViewModel[] {
    const term = this.reportSearchTerm.trim().toLowerCase();

    if (!term) return this.filteredReports;

    return this.filteredReports.filter((report) => {
      const haystack = [
        report.id,
        this.getReportTypeLabel(report.reportType ?? ''),
        this.getSpeciesLabel(report.species ?? ''),
        this.getStatusLabel(report.reportStatus ?? ''),
        report.incidentDate,
        report.addressText,
      ]
        .filter((value) => value != null)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }

  get pagedReports(): ReportViewModel[] {
    const start = (this.reportPage - 1) * this.reportPageSize;
    return this.searchedReports.slice(start, start + this.reportPageSize);
  }

  get reportTotalPages(): number {
    return Math.max(1, Math.ceil(this.searchedReports.length / this.reportPageSize));
  }

  applyReportSearch(): void {
    this.reportPage = 1;
  }

  setReportPageSize(size: number): void {
    this.reportPageSize = Number(size);
    this.reportPage = 1;
  }

  prevReportPage(): void {
    this.reportPage = Math.max(1, this.reportPage - 1);
  }

  nextReportPage(): void {
    this.reportPage = Math.min(this.reportTotalPages, this.reportPage + 1);
  }


  private getDataQualityRadarValues(): number[] {
    const total = this.filteredReports.length;

    if (total === 0) {
      return [0, 0, 0, 0, 0, 0];
    }

    const withPhoto = this.filteredReports.filter(
      report => !!report.photoURL || !!report.additionalPhotosURL
    ).length;

    const withGeo = this.filteredReports.filter(
      report => report.latitude != null && report.longitude != null
    ).length;

    const withBreed = this.filteredReports.filter(
      report => !!report.breed
    ).length;

    const withColor = this.filteredReports.filter(
      report => !!report.color
    ).length;

    const withCollar = this.filteredReports.filter(
      report => report.hasCollar
    ).length;

    const withTag = this.filteredReports.filter(
      report => report.hasTag
    ).length;

    return [
      Math.round((withPhoto / total) * 100),
      Math.round((withGeo / total) * 100),
      Math.round((withBreed / total) * 100),
      Math.round((withColor / total) * 100),
      Math.round((withCollar / total) * 100),
      Math.round((withTag / total) * 100)
    ];
  }

  private getRewardViewsScatterData(): { x: number; y: number }[] {
    return this.filteredReports
      .filter(report => report.rewardAmount != null && report.views != null)
      .map(report => ({
        x: Number(report.rewardAmount ?? 0),
        y: Number(report.views ?? 0)
      }));
  }

  private getRadiusViewsBubbleData(): { x: number; y: number; r: number }[] {
    return this.filteredReports
      .filter(report => report.searchRadiusMeters != null && report.views != null)
      .map(report => {
        const reward = Number(report.rewardAmount ?? 0);

        return {
          x: Number(report.searchRadiusMeters ?? 0),
          y: Number(report.views ?? 0),
          r: reward > 0 ? Math.min(Math.max(reward / 100, 4), 18) : 4
        };
      });
  }
  private createChart(
    canvasId: string,
    config: ChartConfiguration
  ): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;

    if (!canvas) return;

    const chart = new Chart(canvas, {
      ...config,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...config.options
      }
    });

    this.charts.push(chart);
  }

  statusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [] }]
  };

  speciesChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [] }]
  };

  monthlyTrendChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Reportes' }]
  };

  zoneChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Reportes' }]
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  horizontalBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

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


  breedDistribution: { label: string; value: number; percentage: number }[] = [];
  sizeDistribution: { label: string; value: number; percentage: number }[] = [];
  sexDistribution: { label: string; value: number; percentage: number }[] = [];
  colorDistribution: { label: string; value: number; percentage: number }[] = [];

  geolocatedReports = 0;
  geolocationCoverageRate = 0;

  reportsWithPhoto = 0;
  photoCoverageRate = 0;

  reportsWithReward = 0;
  rewardRate = 0;

  reportsWithCollar = 0;
  reportsWithTag = 0;

  totalViews = 0;
  averageViews = 0;

  averageSearchRadiusMeters = 0;
  dataQualityScore = 0;

  ngOnInit(): void {
    Chart.register(...registerables);
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

      this.reportPage = 1;
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
    this.reportPage = 1;
  }

  private calculateDistributions(): void {
    this.statusDistribution = this.buildDistribution(this.filteredReports, 'reportStatus');
    this.speciesDistribution = this.buildDistribution(this.filteredReports, 'species');
    this.monthlyTrend = this.buildMonthlyTrend(this.filteredReports);
    this.zoneDistribution = this.buildZoneDistribution(this.filteredReports);


    this.breedDistribution = this.buildDistribution(this.filteredReports, 'breed').slice(0, 5);
    this.sizeDistribution = this.buildDistribution(this.filteredReports, 'size');
    this.sexDistribution = this.buildDistribution(this.filteredReports, 'sex');
    this.colorDistribution = this.buildColorDistribution(this.filteredReports).slice(0, 5);

    this.updateCharts();
    this.calculateAdvancedMetrics();
  }

  private updateCharts(): void {
    this.statusChartData = {
      labels: this.statusDistribution.map(item => this.getStatusLabel(item.label)),
      datasets: [
        {
          data: this.statusDistribution.map(item => item.value)
        }
      ]
    };

    this.speciesChartData = {
      labels: this.speciesDistribution.map(item => this.getSpeciesLabel(item.label)),
      datasets: [
        {
          data: this.speciesDistribution.map(item => item.value)
        }
      ]
    };

    this.monthlyTrendChartData = {
      labels: this.monthlyTrend.map(item => item.label),
      datasets: [
        {
          data: this.monthlyTrend.map(item => item.value),
          label: 'Reportes',
          tension: 0.35,
          fill: false
        }
      ]
    };

    this.zoneChartData = {
      labels: this.zoneDistribution.map(item => item.label),
      datasets: [
        {
          data: this.zoneDistribution.map(item => item.value),
          label: 'Reportes'
        }
      ]
    };
  }

  private calculateAdvancedMetrics(): void {
    const base = this.filteredReports;
    const total = base.length;

    if (total === 0) {
      this.geolocatedReports = 0;
      this.geolocationCoverageRate = 0;
      this.reportsWithPhoto = 0;
      this.photoCoverageRate = 0;
      this.reportsWithReward = 0;
      this.rewardRate = 0;
      this.reportsWithCollar = 0;
      this.reportsWithTag = 0;
      this.totalViews = 0;
      this.averageViews = 0;
      this.averageSearchRadiusMeters = 0;
      this.dataQualityScore = 0;
      return;
    }

    this.geolocatedReports = base.filter(r => r.latitude != null && r.longitude != null).length;
    this.geolocationCoverageRate = Math.round((this.geolocatedReports / total) * 100);

    this.reportsWithPhoto = base.filter(r => !!r.photoURL || !!r.additionalPhotosURL).length;
    this.photoCoverageRate = Math.round((this.reportsWithPhoto / total) * 100);

    //this.reportsWithReward = base.filter(r => r.offersReward).length;
    this.rewardRate = Math.round((this.reportsWithReward / total) * 100);

    this.reportsWithCollar = base.filter(r => r.hasCollar).length;
    this.reportsWithTag = base.filter(r => r.hasTag).length;

    //this.totalViews = base.reduce((sum, report) => sum + (report.views ?? 0), 0);
    this.averageViews = Math.round(this.totalViews / total);

    const reportsWithRadius = base.filter(r => r.searchRadiusMeters != null);
    this.averageSearchRadiusMeters = reportsWithRadius.length > 0
      ? Math.round(
          reportsWithRadius.reduce((sum, r) => sum + (r.searchRadiusMeters ?? 0), 0) / reportsWithRadius.length
        )
      : 0;

    const breedCompleteness = base.filter(r => !!r.breed).length / total;
    const colorCompleteness = base.filter(r => !!r.color).length / total;
    const geoCompleteness = this.geolocatedReports / total;
    const photoCompleteness = this.reportsWithPhoto / total;

    this.dataQualityScore = Math.round(
      ((breedCompleteness + colorCompleteness + geoCompleteness + photoCompleteness) / 4) * 100
    );
  }

private buildColorDistribution(
  reports: ReportViewModel[]
): { label: string; value: number; percentage: number }[] {
  const colors = reports
    .flatMap(report => (report.color ?? '').split(','))
    .map(color => color.trim())
    .filter(Boolean);

  const total = colors.length;

  if (total === 0) {
    return [];
  }

  const counts = colors.reduce<Record<string, number>>((acc, color) => {
    acc[color] = (acc[color] ?? 0) + 1;
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
  private buildMonthlyTrend(
    reports: ReportViewModel[]
  ): { label: string; value: number; percentage: number }[] {
    const validReports = reports.filter(report => !!report.incidentDate);
    const total = validReports.length;

    if (total === 0) {
      return [];
    }

    const counts = validReports.reduce<Record<string, { value: number; date: Date }>>((acc, report) => {
      const date = new Date(report.incidentDate!);

      if (Number.isNaN(date.getTime())) {
        return acc;
      }

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[key]) {
        acc[key] = {
          value: 0,
          date: new Date(date.getFullYear(), date.getMonth(), 1)
        };
      }

      acc[key].value++;
      return acc;
    }, {});

    return Object.values(counts)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(item => ({
        label: item.date.toLocaleDateString('es-MX', {
          month: 'short',
          year: 'numeric'
        }),
        value: item.value,
        percentage: Math.round((item.value / total) * 100)
      }));
  }


  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      Active: 'enterprise-badge enterprise-badge-blue',
      Resolved: 'enterprise-badge enterprise-badge-green',
      Recovered: 'enterprise-badge enterprise-badge-green',
      Cancelled: 'enterprise-badge enterprise-badge-red'
    };

    return classes[status] ?? 'enterprise-badge enterprise-badge-gray';
  }

  getReportTypeBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      Lost: 'enterprise-badge enterprise-badge-amber',
      Found: 'enterprise-badge enterprise-badge-blue',
      Stray: 'enterprise-badge enterprise-badge-gray'
    };

    return classes[type] ?? 'enterprise-badge enterprise-badge-gray';
  }

  getSpeciesBadgeClass(species: string): string {
    const classes: Record<string, string> = {
      Dog: 'enterprise-badge enterprise-badge-indigo',
      Cat: 'enterprise-badge enterprise-badge-purple'
    };

    return classes[species] ?? 'enterprise-badge enterprise-badge-gray';
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

  exportToExcel(): void {
    const generatedAt = new Date().toLocaleString('es-MX');

    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ['REPORTE ANALÍTICO PETRADAR'],
      [],
      ['Fecha de generación', generatedAt],
      ['Total de reportes filtrados', this.totalReports],
      ['Reportes activos', this.activeReports],
      ['Mascotas recuperadas', this.recoveredReports],
      ['Avistamientos', this.sightingReports],
      ['Mascotas perdidas', this.lostReports],
      ['Tasa de recuperación', `${this.recoveryRate}%`],
      [],
      ['SLO / SLI'],
      ['Tiempo de respuesta API', `${this.responseTimeMs} ms`],
      ['Objetivo tiempo respuesta', `≤ ${this.responseTimeObjectiveMs} ms`],
      ['Estado SLO respuesta', this.getResponseTimeStatus()],
      ['Disponibilidad consulta', `${this.availabilityPercentage}%`],
      ['Objetivo disponibilidad', `${this.availabilityObjective}%`],
      ['Estado disponibilidad', this.getAvailabilityStatus()],
      ['Errores de carga sesión', this.analyticsErrors],
      [],
      ['FILTROS APLICADOS'],
      ['Estado', this.selectedStatus || 'Todos'],
      ['Tipo de reporte', this.selectedType || 'Todos'],
      ['Especie', this.selectedSpecies || 'Todas'],
      ['Fecha inicial', this.selectedStartDate || 'Sin filtro'],
      ['Fecha final', this.selectedEndDate || 'Sin filtro']
    ];

    const distributionsData = [
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
      ])
    ];

    const trendsData = [
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
      ])
    ];

    const detailData = [
      [
        'ID',
        'Tipo de reporte',
        'Especie',
        'Estado',
        'Fecha incidente',
        //'Ubicación textual',
        'Latitud',
        'Longitud'
      ],
      ...this.filteredReports.map(report => [
        report.id ?? '',
        this.getReportTypeLabel(report.reportType ?? ''),
        this.getSpeciesLabel(report.species ?? ''),
        this.getStatusLabel(report.reportStatus ?? ''),
        report.incidentDate ?? '',
        //report.addressText ?? '',
        report.latitude ?? '',
        report.longitude ?? ''
      ])
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const distributionsSheet = XLSX.utils.aoa_to_sheet(distributionsData);
    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
    const detailSheet = XLSX.utils.aoa_to_sheet(detailData);

    this.applyWorksheetStyle(summarySheet, [34, 32, 24]);
    this.applyWorksheetStyle(distributionsSheet, [36, 18, 18]);
    this.applyWorksheetStyle(trendsSheet, [36, 18, 18]);
    this.applyWorksheetStyle(detailSheet, [12, 22, 18, 18, 26, 70, 16, 16]);

    this.applyMergeRanges(summarySheet, ['A1:C1']);
    this.applyMergeRanges(distributionsSheet, ['A1:C1', 'A6:C6']);
    this.applyMergeRanges(trendsSheet, ['A1:C1', 'A6:C6']);

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
    XLSX.utils.book_append_sheet(workbook, distributionsSheet, 'Distribuciones');
    XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Tendencias y zonas');
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detalle reportes');

    XLSX.writeFile(
      workbook,
      `petradar-reporte-analitico-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

 private applyWorksheetStyle(worksheet: XLSX.WorkSheet, columnWidths: number[]): void {
    worksheet['!cols'] = columnWidths.map(width => ({ width }));

    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1:A1');

    const titleStyle = {
      font: { name: 'Arial', sz: 15, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1E3A8A' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: this.getExcelBorder()
    };

    const headerStyle = {
      font: { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '334155' } },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true
      },
      border: this.getExcelBorder()
    };

    const sectionStyle = {
      font: { name: 'Arial', sz: 12, bold: true, color: { rgb: '1F2937' } },
      fill: { fgColor: { rgb: 'E5E7EB' } },
      alignment: {
        horizontal: 'left',
        vertical: 'center',
        wrapText: true
      },
      border: this.getExcelBorder()
    };

    const bodyStyle = {
      font: { name: 'Arial', sz: 10, color: { rgb: '111827' } },
      alignment: {
        horizontal: 'left',
        vertical: 'top',
        wrapText: true
      },
      border: this.getExcelBorder()
    };

    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];

        if (!cell) continue;

        const value = String(cell.v ?? '');

        if (row === 0) {
          cell.s = titleStyle;
        } else if (
          value.includes('DISTRIBUCIÓN') ||
          value.includes('TENDENCIA') ||
          value.includes('TOP ZONAS') ||
          value.includes('SLO') ||
          value.includes('FILTROS') ||
          value.includes('DETALLE')
        ) {
          cell.s = sectionStyle;
        } else if (
          ['Estado', 'Especie', 'Periodo', 'Zona', 'Cantidad', 'Porcentaje', 'ID', 'Tipo de reporte'].includes(value)
        ) {
          cell.s = headerStyle;
        } else {
          cell.s = bodyStyle;
        }
      }
    }
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

  private getExcelBorder(): any {
    return {
      top: { style: 'thin', color: { rgb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } }
    };
  }

  private applyMergeRanges(worksheet: XLSX.WorkSheet, ranges: string[]): void {
    worksheet['!merges'] = ranges.map(range => XLSX.utils.decode_range(range));
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

  getReportTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      Lost: 'Perdido',
      Found: 'Encontrado',
      Stray: 'Callejero'
    };

    return labels[type] ?? type;
  }
}