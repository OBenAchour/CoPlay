import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// --- Branche "competition" (ton travail) ---
import {
  StatistiqueService,
  JobStatusResponse,
  JobResultResponse
} from '../services/statistique.service';

// --- Branche "main" (travail de l'équipe) ---
import { CompetitionService } from '../services/competition.service';
import { MatchService } from '../services/match.service';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { CreateTicketsRequest } from '../../../Core/Models/Competitions/Ticket';

// --- Interface branche "competition" ---
interface MatchEntry {
  jobId: string;
  team1: string;
  team2: string;
  team1Color: string;
  team2Color: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  possessionTeam1?: string;
  possessionTeam2?: string;
  dominantTeam?: string;
  processingTime?: number;
  timestamp: Date;
}

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.css']
})
export class MatchListComponent implements OnInit {

  // --- State branche "competition" ---
  matches: MatchEntry[] = [];

  // --- State branche "main" ---
  competitions: any[] = [];
  allMatches: any[] = [];
  filteredMatches: any[] = [];
  selectedCompetitionId = '';
  loading = false;
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
    private statistiqueService: StatistiqueService,  // ton travail
    private competitionService: CompetitionService,  // équipe
    private matchService: MatchService,              // équipe
    private ticketService: TicketService,            // équipe
    private authService: AuthService,                // équipe
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFromStorage();                    // ton travail
    this.isAdmin = this.authService.isAdmin(); // équipe
    this.loadCompetitions();                   // équipe
  }

  // ════════════════════════════════
  // TON TRAVAIL — branche competition
  // ════════════════════════════════

  addMatch(entry: MatchEntry): void {
    this.matches.unshift(entry);
    this.saveToStorage();
  }

  removeMatch(index: number): void {
    this.matches.splice(index, 1);
    this.saveToStorage();
  }

  viewDetails(match: MatchEntry): void {
    if (match.status === 'completed') {
      this.router.navigate(['/competitions/statistics'], {
        queryParams: { jobId: match.jobId, team1: match.team1, team2: match.team2 }
      });
    }
  }

  downloadVideo(match: MatchEntry): void {
    if (match.jobId) {
      window.open(this.statistiqueService.getDownloadUrl(match.jobId), '_blank');
    }
  }

  refreshStatus(match: MatchEntry): void {
    if (match.status === 'processing' || match.status === 'uploading') {
      this.statistiqueService.getJobStatus(match.jobId).subscribe({
        next: (s: JobStatusResponse) => {
          match.progress = Math.round((s.progress || 0) * 100);
          if (s.status === 'completed') {
            match.status = 'completed';
            this.fetchMatchResult(match);
          } else if (s.status === 'failed') {
            match.status = 'failed';
          }
          this.saveToStorage();
        }
      });
    }
  }

  fetchMatchResult(match: MatchEntry): void {
    this.statistiqueService.getJobResult(match.jobId).subscribe({
      next: (res: JobResultResponse) => {
        if (res.video?.possession) {
          match.possessionTeam1 = res.video.possession['Team 1'];
          match.possessionTeam2 = res.video.possession['Team 2'];
          const p1 = parseFloat((match.possessionTeam1 || '0').replace('%', ''));
          const p2 = parseFloat((match.possessionTeam2 || '0').replace('%', ''));
          match.dominantTeam = p1 >= p2 ? match.team1 : match.team2;
        }
        match.processingTime = res.processing_time_seconds;
        match.status = 'completed';
        this.saveToStorage();
      }
    });
  }

  trackByJob(_: number, match: MatchEntry): string {
    return match.jobId;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('match_history', JSON.stringify(this.matches));
    } catch (_) {}
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem('match_history');
      if (raw) {
        this.matches = JSON.parse(raw).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (_) {
      this.matches = [];
    }
  }

  // ════════════════════════════════
  // TRAVAIL ÉQUIPE — branche main
  // ════════════════════════════════

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

  isMatchFinished(status: string): boolean {
    return status === 'FINISHED' || status === 'CANCELLED';
  }

  getTeamName(team: any): string {
    if (!team) return '?';
    return team.name || team.teamName || team;
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

  // Fusion des deux getStatusClass / getStatusLabel
  getStatusClass(status: string): string {
    switch (status) {
      case 'PLAYED':     return 'bg-success';
      case 'SCHEDULED':  return 'bg-primary';
      case 'CANCELLED':  return 'bg-danger';
      case 'VALIDATED':  return 'bg-warning text-dark';
      case 'uploading':  return 'status-uploading';
      case 'processing': return 'status-processing';
      case 'completed':  return 'status-completed';
      case 'failed':     return 'status-failed';
      default:           return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PLAYED':     return 'Joué';
      case 'SCHEDULED':  return 'Programmé';
      case 'CANCELLED':  return 'Annulé';
      case 'VALIDATED':  return 'Validé';
      case 'uploading':  return 'Uploading…';
      case 'processing': return 'Processing…';
      case 'completed':  return 'Completed';
      case 'failed':     return 'Failed';
      default:           return status;
    }
  }
}