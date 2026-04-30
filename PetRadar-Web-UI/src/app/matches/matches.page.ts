import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchesHttpService, MatchViewModel } from './matches-http.service';

type MatchStatus = 'Pending' | 'Confirmed' | 'Dismissed';

@Component({
  selector: 'app-matches-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matches.page.html',
  styleUrl: './matches.page.scss',
})
export class MatchesPageComponent {
  private readonly router = inject(Router);
  private readonly matchesService = inject(MatchesHttpService);
  private readonly destroyRef = inject(DestroyRef);

  matches: MatchViewModel[] = [];
  filteredMatches: MatchViewModel[] = [];

  isLoading = false;
  loadError = '';
  statusActionError = '';
  updatingMatchId: number | null = null;
  deletingMatchId: number | null = null;
  matchActionError = '';

  searchTerm = '';

  constructor() {
    this.loadMatches();
  }

  private loadMatches(): void {
    this.isLoading = true;
    this.loadError = '';

    this.matchesService
      .getMatches()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.matches = data ?? [];
          this.applySearch();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar matches', err);
          this.loadError = 'No fue posible cargar las coincidencias.';
          this.isLoading = false;
        },
      });
  }

  applySearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredMatches = [...this.matches];
      return;
    }

    this.filteredMatches = this.matches.filter((match) => {
      const haystack = [
        match.id,
        match.status,
        match.lostReport?.id,
        match.lostReport?.species,
        match.lostReport?.breed,
        match.lostReport?.color,
        match.strayReport?.id,
        match.strayReport?.species,
        match.strayReport?.breed,
        match.strayReport?.color,
      ]
        .filter((value) => value != null)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
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

  formatScore(value?: number | null): string {
    if (value == null) return 'N/D';
    return Number(value).toFixed(3);
  }

  formatDistance(value?: number | null): string {
    if (value == null) return 'N/D';
    return `${Number(value).toFixed(2)} km`;
  }

  getMatchStatusLabel(value?: string | null): string {
    switch (value) {
      case 'Pending':
        return 'Pendiente';
      case 'Confirmed':
        return 'Confirmado';
      case 'Dismissed':
        return 'Descartado';
      default:
        return value || 'N/D';
    }
  }

  getMatchStatusBadgeClass(value?: string | null): string {
    switch (value) {
      case 'Pending':
        return 'text-bg-warning';
      case 'Confirmed':
        return 'text-bg-success';
      case 'Dismissed':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }

  getReportSummary(report?: MatchViewModel['lostReport'] | MatchViewModel['strayReport']): string {
    if (!report) return 'N/D';

    const parts = [
      report.species ?? null,
      report.breed ?? null,
      report.color ?? null,
    ].filter(Boolean);

    return parts.length ? parts.join(' • ') : 'N/D';
  }

  openReportDetail(reportId?: number | null): void {
    if (!reportId) return;
    this.router.navigate(['/app/reports', reportId]);
  }

  canConfirmOrDismiss(match: MatchViewModel): boolean {
    return match.status === 'Pending';
  }

  canRestoreToPending(match: MatchViewModel): boolean {
    return match.status === 'Confirmed' || match.status === 'Dismissed';
  }

  confirmMatch(match: MatchViewModel): void {
    this.updateStatus(match, 'Confirmed');
  }

  dismissMatch(match: MatchViewModel): void {
    this.updateStatus(match, 'Dismissed');
  }

  restoreToPending(match: MatchViewModel): void {
    this.updateStatus(match, 'Pending');
  }

  private updateStatus(match: MatchViewModel, newStatus: MatchStatus): void {
    this.statusActionError = '';

    if (!match.id) return;

    const actionLabel =
      newStatus === 'Confirmed'
        ? 'confirmar'
        : newStatus === 'Dismissed'
        ? 'descartar'
        : 'regresar a pendiente';

    const confirmed = window.confirm(
      `¿Deseas ${actionLabel} el match #${match.id}?`
    );

    if (!confirmed) return;

    this.updatingMatchId = match.id;

    this.matchesService
      .updateMatchStatus(match.id, newStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          match.status = newStatus;

          if (newStatus === 'Confirmed') {
            match.confirmationDate = new Date().toISOString();
          }

          if (newStatus === 'Pending') {
            match.confirmationDate = null;
          }

          this.updatingMatchId = null;
          this.applySearch();
        },
        error: (err) => {
          console.error('Error al actualizar match', err);
          this.statusActionError = `No fue posible actualizar el match #${match.id}.`;
          this.updatingMatchId = null;
        },
      });
  }

  deleteMatch(match: any, event?: Event): void {
  event?.stopPropagation();

  if (!match.id) return;

  const confirmed = window.confirm(
    `¿Deseas eliminar el match #${match.id}? Esta acción no se puede deshacer.`
  );

  if (!confirmed) return;

  this.deletingMatchId = match.id;
  this.matchActionError = '';

  this.matchesService.deleteMatch(match.id).subscribe({
    next: () => {
      this.deletingMatchId = null;

      // Ajusta estos nombres según tus arrays reales
      this.matches = this.matches.filter((m: any) => m.id !== match.id);
      this.filteredMatches = this.filteredMatches.filter((m: any) => m.id !== match.id);
    },
    error: () => {
      this.deletingMatchId = null;
      this.matchActionError = `No fue posible eliminar el match #${match.id}.`;
    },
  });
}
}