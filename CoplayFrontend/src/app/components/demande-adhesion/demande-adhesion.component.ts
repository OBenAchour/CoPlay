import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../services/Team/team.service';
import { DemandeAdhesionService } from '../../services/DemandeAdhesion/demande-adhesion.service';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { Team } from '../../Core/Models/Teams/Team';

interface RequestEntry {
  teamId:    string;
  teamName:  string;
  sentAt:    Date;
  status:    'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
}

@Component({
  selector: 'app-demande-adhesion',
  templateUrl: './demande-adhesion.component.html',
  styleUrls: ['./demande-adhesion.component.css']
})
export class DemandeAdhesionComponent implements OnInit {

  teams: Team[]            = [];
  sentRequests: RequestEntry[] = [];
  loading   = false;
  sending   = '';          // teamId en cours d'envoi
  toast     = '';
  toastType: 'success' | 'error' = 'success';

  get currentUserId(): string { return this.auth.getUserId(); }

  constructor(
    private teamSvc:   TeamService,
    private demandeSvc: DemandeAdhesionService,
    private auth:      AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.teamSvc.getAllTeams().subscribe({
      next:  (data: any) => { this.teams = data; this.loading = false; },
      error: ()          => { this.loading = false; }
    });
  }

  /** Vérifier si une demande a déjà été envoyée pour cette équipe */
  alreadySent(teamId: string): boolean {
    return this.sentRequests.some(r => r.teamId === teamId);
  }

  rejoindre(team: Team): void {
    if (!team.teamId || this.alreadySent(team.teamId)) return;

    this.sending = team.teamId;
    this.demandeSvc.rejoindre(team.teamId, this.currentUserId).subscribe({
      next: () => {
        this.sentRequests.push({
          teamId:   team.teamId!,
          teamName: team.name,
          sentAt:   new Date(),
          status:   'EN_ATTENTE'
        });
        this.sending = '';
        this.showToast(`Demande envoyée pour « ${team.name} » !`, 'success');
      },
      error: (err: any) => {
        this.sending = '';
        const msg = err?.error?.message || 'Erreur lors de l\'envoi.';
        this.showToast(msg, 'error');
      }
    });
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast     = msg;
    this.toastType = type;
    setTimeout(() => this.toast = '', 4000);
  }

  sportIcon(sport: string): string {
    const icons: Record<string, string> = {
      'Football': '⚽', 'Basketball': '🏀', 'Padel': '🏓',
      'Tennis': '🎾',  'Volleyball': '🏐', 'Rugby': '🏉', 'Handball': '🤾'
    };
    return icons[sport] || '🏆';
  }

  teamInitial(name: string): string {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
