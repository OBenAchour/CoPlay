import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// === IMPORTS CORRIGÉS ===
import { EventStatus } from 'src/app/Core/Models/Events & Training/EventStatus';
import { CoplayEvent } from 'src/app/Core/Models/Events & Training/CoplayEvent';
import { EventService } from 'src/app/Core/Services/Events & Training/EventService/event-service.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list-component.component.html',   // ← Important : nom du fichier html
  styleUrls: ['./event-list-component.component.css']     // ← nom du fichier css
})
export class EventListComponent implements OnInit {

  events: CoplayEvent[] = [];
  filteredEvents: CoplayEvent[] = [];
  selectedStatus: string = 'ALL';
  isLoading: boolean = false;
  errorMessage: string = '';

  teamId: string = 'test-team-001';

  statusOptions = [
    { value: 'ALL',       label: 'Tous' },
    { value: 'SCHEDULED', label: 'Planifiés' },
    { value: 'ONGOING',   label: 'En cours' },
    { value: 'COMPLETED', label: 'Terminés' },
    { value: 'CANCELLED', label: 'Annulés' }
  ];

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  // ... le reste de ton code (loadEvents, filterByStatus, etc.) reste le même

loadEvents(): void {
  this.isLoading = true;
  this.errorMessage = '';

  // ✅ getPublicEvents() pour tester — on voit déjà un event public en base
  this.eventService.getPublicEvents().subscribe({
    next: (data: CoplayEvent[]) => {
      this.events = data;
      this.applyFilter();
      this.isLoading = false;
    },
    error: (err) => {
      this.errorMessage = 'Erreur lors du chargement des événements.';
      this.isLoading = false;
      console.error('Erreur:', err);
    }
  });
}

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.selectedStatus === 'ALL') {
      this.filteredEvents = [...this.events];
    } else {
      this.filteredEvents = this.events.filter(
        e => e.status === this.selectedStatus
      );
    }
  }

  goToDetail(eventId: string): void {
    this.router.navigate(['/events', eventId]);
  }

  goToCreate(): void {
    this.router.navigate(['/events/create']);
  }

  getStatusClass(status: EventStatus | undefined): string {
    switch (status) {
      case EventStatus.SCHEDULED: return 'status-scheduled';
      case EventStatus.ONGOING:   return 'status-ongoing';
      case EventStatus.COMPLETED: return 'status-completed';
      case EventStatus.CANCELLED: return 'status-cancelled';
      default: return '';
    }
  }

  getStatusLabel(status: EventStatus | undefined): string {
    switch (status) {
      case EventStatus.SCHEDULED: return 'Planifié';
      case EventStatus.ONGOING:   return 'En cours';
      case EventStatus.COMPLETED: return 'Terminé';
      case EventStatus.CANCELLED: return 'Annulé';
      default: return 'Inconnu';
    }
  }

  countByStatus(status: string): number {
    return this.events.filter(e => e.status === status).length;
  }

  getStatusKey(status: EventStatus | undefined): string {
    return status ? status.toLowerCase() : '';
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}