import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompetitionService } from '../services/competition.service';
import { MatchService } from '../services/match.service';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { CreateTicketsRequest } from '../../../Core/Models/Competitions/Ticket';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="main-background"></div>

      <div class="content-overlay container pt-5">

        <div class="text-center mb-4">
          <h1 class="fw-bold text-white text-shadow">📅 Matchs des Compétitions</h1>
          <p class="text-white-50">Sélectionnez une compétition pour voir les matchs</p>
        </div>

        <!-- Sélecteur compétition -->
        <div class="glass-style p-4 mx-auto mb-4" style="max-width: 500px;">
          <label class="form-label fw-bold text-dark">🏆 Compétition :</label>
          <select class="form-select rounded-3"
                  [(ngModel)]="selectedCompetitionId"
                  (change)="loadMatches()">
            <option value="">-- Choisir une compétition --</option>
            <option *ngFor="let comp of competitions"
                    [value]="comp.id || comp.competitionId">
              {{ comp.name }}
            </option>
          </select>
        </div>

        <!-- Loader -->
        <div *ngIf="loading" class="text-center p-4">
          <div class="spinner-border text-light"></div>
          <p class="text-white mt-2">Chargement des matchs...</p>
        </div>

        <!-- Liste des matchs -->
        <div *ngIf="!loading && filteredMatches.length > 0"
             class="row justify-content-center g-4">

          <div class="col-md-6 col-lg-5" *ngFor="let match of filteredMatches">
            <div class="match-card glass-style p-4">

              <!-- Journée -->
              <div class="text-center mb-3">
                <span class="badge bg-dark px-3 py-2 rounded-pill">
                  Journée {{ match.numeroJournee || match.round || '?' }}
                </span>
              </div>

              <!-- Équipes et score -->
              <div class="row text-center align-items-center">
                <div class="col-5">
                  <div class="team-name">{{ getTeamName(match.equipeA) }}</div>
                </div>
                <div class="col-2">
                  <div class="score-text">
                    {{ match.scoreA !== null && match.scoreA !== undefined ? match.scoreA : '?' }}
                    -
                    {{ match.scoreB !== null && match.scoreB !== undefined ? match.scoreB : '?' }}
                  </div>
                </div>
                <div class="col-5">
                  <div class="team-name">{{ getTeamName(match.equipeB) }}</div>
                </div>
              </div>

              <!-- Date et statut -->
              <div class="text-center mt-3">
                <p class="text-muted small mb-1">
                  📅 {{ match.dateMatch || 'Date non définie' }}
                </p>
                <span class="badge rounded-pill px-3 py-2"
                      [ngClass]="getStatusClass(match.status)">
                  {{ getStatusLabel(match.status) }}
                </span>
              </div>

              <!-- ✅ Voir billets : seulement si match pas terminé -->
<button *ngIf="!isMatchFinished(match.status)"
        class="btn btn-tickets"
        (click)="goToTickets(match.id)">
  🎟️ Voir billets
</button>

<!-- ✅ Message si match terminé -->
<span *ngIf="isMatchFinished(match.status)"
      class="text-muted small fst-italic">
  Match terminé — billets non disponibles
</span>
               <!-- ✅ Générer tickets : admin + match pas terminé -->
<button *ngIf="isAdmin && !isMatchFinished(match.status)"
        class="btn btn-generate"
        (click)="openGenerateForm(match.id)">
  ⚙️ Générer tickets
</button>

              </div>
            </div>
          </div>
        </div>

        <!-- Aucun match -->
        <div *ngIf="!loading && selectedCompetitionId && filteredMatches.length === 0"
             class="alert alert-info text-center mx-auto mt-4"
             style="max-width: 500px;">
          Aucun match trouvé pour cette compétition.
        </div>

        <div *ngIf="!selectedCompetitionId && !loading"
             class="text-center text-white-50 mt-4">
          <p>👆 Sélectionnez une compétition ci-dessus</p>
        </div>

      </div>
    

    <!-- MODAL GÉNÉRATION TICKETS (admin seulement) -->
    <div *ngIf="showGenerateForm && isAdmin"
         class="modal-overlay"
         (click)="closeGenerateForm()">
      <div class="modal-box p-4" (click)="$event.stopPropagation()">

        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold text-dark mb-0">⚙️ Générer les tickets</h5>
          <button class="btn btn-sm btn-outline-secondary"
                  (click)="closeGenerateForm()">✕</button>
        </div>

        <!-- VIP -->
        <div class="mb-3 p-3 rounded-3" style="background: rgba(253,160,133,0.2)">
          <h6 class="fw-bold">👑 VIP</h6>
          <div class="row g-2">
            <div class="col-6">
              <label class="form-label small">Nombre de places</label>
              <input type="number" class="form-control form-control-sm"
                     [(ngModel)]="generateRequest.vipCount" min="0">
            </div>
            <div class="col-6">
              <label class="form-label small">Prix (DT)</label>
              <input type="number" class="form-control form-control-sm"
                     [(ngModel)]="generateRequest.vipPrice" min="0">
            </div>
          </div>
        </div>

        <!-- Tribune -->
        <div class="mb-3 p-3 rounded-3" style="background: rgba(0,210,255,0.15)">
          <h6 class="fw-bold">🏟️ Tribune</h6>
          <div class="row g-2">
            <div class="col-6">
              <label class="form-label small">Nombre de places</label>
              <input type="number" class="form-control form-control-sm"
                     [(ngModel)]="generateRequest.tribuneCount" min="0">
            </div>
            <div class="col-6">
              <label class="form-label small">Prix (DT)</label>
              <input type="number" class="form-control form-control-sm"
                     [(ngModel)]="generateRequest.tribunePrice" min="0">
            </div>
          </div>
        </div>

        <!-- Pelouse -->
        <div class="mb-3 p-3 rounded-3" style="background: rgba(86,171,47,0.15)">
          <h6 class="fw-bold">⚽ Pelouse</h6>
          <div class="row g-2">
            <div class="col-6">
              <label class="form-label small">Nombre de places</label>
              <input type="number" class="form-control form-control-sm"
                     [(ngModel)]="generateRequest.pelouseCount" min="0">
            </div>
            <div class="col-6">
              <label class="form-label small">Prix (DT)</label>
              <input type="number" class="form-control form-control-sm"
                     [(ngModel)]="generateRequest.pelousePrice" min="0">
            </div>
          </div>
        </div>

        <div *ngIf="generateSuccess" class="alert alert-success py-2 small">
          {{ generateSuccess }}
        </div>
        <div *ngIf="generateError" class="alert alert-danger py-2 small">
          {{ generateError }}
        </div>

        <button class="btn btn-success w-100 mt-2"
                (click)="generateTickets()"
                [disabled]="generating">
          <span *ngIf="generating"
                class="spinner-border spinner-border-sm me-2"></span>
          {{ generating ? 'Génération...' : 'Générer les tickets' }}
        </button>

      </div>
    </div>
  `,
  styles: [`
    .page-container {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
    }
    .main-background {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background-image: url('/assets/Champion_Coupe.png');
      background-size: cover;
      background-position: center;
      z-index: 1;
    }
    .content-overlay { position: relative; z-index: 2; }
    .text-shadow { text-shadow: 2px 2px 8px rgba(0,0,0,0.6); }
    .glass-style {
      background: rgba(255,255,255,0.45) !important;
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 20px;
    }
    .match-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .match-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 15px 35px rgba(0,0,0,0.25) !important;
    }
    .team-name {
      font-weight: 700;
      font-size: 1rem;
      color: #1a1a2e;
      word-break: break-word;
    }
    .score-text {
      font-size: 1.3rem;
      font-weight: 800;
      color: #1a1a2e;
    }
    .btn-tickets {
      background: linear-gradient(135deg, #f6d365, #fda085);
      border: none; color: #fff; font-weight: 600;
      border-radius: 12px; padding: 8px 16px;
      font-size: 0.85rem; transition: opacity 0.2s;
    }
    .btn-tickets:hover { opacity: 0.85; color: #fff; }
    .btn-generate {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none; color: #fff; font-weight: 600;
      border-radius: 12px; padding: 8px 16px;
      font-size: 0.85rem; transition: opacity 0.2s;
    }
    .btn-generate:hover { opacity: 0.85; color: #fff; }
    .modal-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.55);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-box {
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
      background: rgba(255,255,255,0.95) !important;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.4);
      backdrop-filter: blur(15px);
    }
  `]
})
export class MatchListComponent implements OnInit {

  competitions: any[] = [];
  allMatches: any[] = [];
  filteredMatches: any[] = [];
  selectedCompetitionId = '';
  loading = false;

  isMatchFinished(status: string): boolean {
  return status === 'FINISHED' || status === 'CANCELLED';
}

  // ✅ Rôle récupéré depuis AuthService
  isAdmin = false;

  showGenerateForm = false;
  selectedMatchForTickets = '';
  generateRequest: CreateTicketsRequest = {
    vipCount: 10,    vipPrice: 50,
    tribuneCount: 20, tribunePrice: 25,
    pelouseCount: 30, pelousePrice: 10
  };
  generateSuccess = '';
  generateError = '';
  generating = false;

  constructor(
    private competitionService: CompetitionService,
    private matchService: MatchService,
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Vérifie si l'utilisateur connecté est admin
    this.isAdmin = this.authService.isAdmin();
    this.loadCompetitions();
  }

  loadCompetitions(): void {
    this.competitionService.getAllCompetitions().subscribe({
      next: (data: any[]) => { this.competitions = data; }
    });
  }

  loadMatches(): void {
    if (!this.selectedCompetitionId) return;
    this.loading = true;
    this.matchService.getCompetitionMatches(this.selectedCompetitionId).subscribe({
      next: (data: any[]) => {
        this.allMatches = data;
        this.filteredMatches = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getTeamName(team: any): string {
    return team?.name || team?.teamId || 'Équipe';
  }

  goToTickets(matchId: string): void {
    this.router.navigate(['/tickets', matchId]);
  }

  openGenerateForm(matchId: string): void {
    this.selectedMatchForTickets = matchId;
    this.showGenerateForm = true;
    this.generateSuccess = '';
    this.generateError = '';
  }

  closeGenerateForm(): void {
    this.showGenerateForm = false;
    this.selectedMatchForTickets = '';
  }

  generateTickets(): void {
    if (!this.selectedMatchForTickets) return;
    this.generating = true;
    this.generateSuccess = '';
    this.generateError = '';

    this.ticketService.generateTickets(
      this.selectedMatchForTickets,
      this.generateRequest
    ).subscribe({
      next: (tickets: any[]) => {
        this.generateSuccess = `✅ ${tickets.length} tickets générés !`;
        this.generating = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.generateError = '❌ Erreur lors de la génération.';
        this.generating = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PLAYED':    return 'bg-success';
      case 'SCHEDULED': return 'bg-primary';
      case 'CANCELLED': return 'bg-danger';
      case 'VALIDATED': return 'bg-warning text-dark';
      default:          return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PLAYED':    return 'Joué';
      case 'SCHEDULED': return 'Programmé';
      case 'CANCELLED': return 'Annulé';
      case 'VALIDATED': return 'Validé';
      default:          return status;
    }
  }
}