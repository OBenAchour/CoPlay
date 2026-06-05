import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../services/Team/team.service';
import { DemandeAdhesionService } from '../../services/DemandeAdhesion/demande-adhesion.service';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { Team } from '../../Core/Models/Teams/Team';

interface DemandePending {
  demandeId: string;
  teamId: string;
  teamName: string;
  userId: string;
  createdAt: Date;
}

@Component({
  selector: 'app-demandes-recues',
  templateUrl: './demandes-recues.component.html',
  styleUrls: ['./demandes-recues.component.css']
})
export class DemandesRecuesComponent implements OnInit {

  myTeams: Team[] = [];
  demandesMap: Record<string, DemandePending[]> = {};

  loading = false;
  processing = '';
  toast = '';
  toastType: 'success' | 'error' = 'success';

  get currentUserId(): string { return this.auth.getUserId(); }

  constructor(
    private teamSvc: TeamService,
    private demandeSvc: DemandeAdhesionService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.teamSvc.getAllTeams().subscribe({
      next: (teams: any) => {
        // Filtrer les équipes du capitaine courant
        this.myTeams = teams.filter((t: Team) => {
          // À améliorer : vérifier que l'user est capitaine
          return true;
        });

        // Charger les demandes pour chaque équipe
        this.myTeams.forEach(team => {
          this.demandeSvc.getReceivedRequests(team.teamId!).subscribe({
            next: (demandes: any) => {
              this.demandesMap[team.teamId!] = demandes
                .filter((d: any) => d.statut === 'PENDING')
                .map((d: any) => ({
                  demandeId: d.demandeId,
                  teamId: d.teamId,
                  teamName: team.name,
                  userId: d.userId,
                  createdAt: new Date(d.createdAt)
                }));
            }
          });
        });

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  acceptDemande(demande: DemandePending): void {
    this.processing = demande.demandeId;
    this.demandeSvc.accepter(demande.demandeId, this.currentUserId).subscribe({
      next: () => {
        this.processing = '';
        this.demandesMap[demande.teamId] = this.demandesMap[demande.teamId].filter(d => d.demandeId !== demande.demandeId);
        this.showToast(`${demande.userId} a rejoint « ${demande.teamName} » !`, 'success');
      },
      error: (err: any) => {
        this.processing = '';
        this.showToast(err?.error?.message || 'Erreur.', 'error');
      }
    });
  }

  refuseDemande(demande: DemandePending): void {
    if (!confirm(`Refuser la demande de ${demande.userId} ?`)) return;

    this.processing = demande.demandeId;
    this.demandeSvc.refuser(demande.demandeId, this.currentUserId).subscribe({
      next: () => {
        this.processing = '';
        this.demandesMap[demande.teamId] = this.demandesMap[demande.teamId].filter(d => d.demandeId !== demande.demandeId);
        this.showToast(`Demande refusée.`, 'success');
      },
      error: (err: any) => {
        this.processing = '';
        this.showToast(err?.error?.message || 'Erreur.', 'error');
      }
    });
  }

  getDemandesTotalCount(): number {
    return Object.values(this.demandesMap).reduce((total, demandes) => total + demandes.length, 0);
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => this.toast = '', 4000);
  }

  teamInitial(name: string): string {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
