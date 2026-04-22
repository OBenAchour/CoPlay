import { Component, OnInit } from '@angular/core';
import { DemandeAdhesionService } from 'src/app/services/DemandeAdhesion/demande-adhesion.service';
import { TeamService } from 'src/app/services/Team/team.service';
import { TeamMemberService } from 'src/app/services/TeamMember/team-member.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { DemandeAdhesion } from 'src/app/Core/Models/Teams/DemandeAdhesion';
import { StatutDemande } from 'src/app/Core/Models/Teams/StatutDemande';
import { Team } from 'src/app/Core/Models/Teams/Team';

@Component({
  selector: 'app-demande-adhesion',
  templateUrl: './demande-adhesion.component.html',
  styleUrls: ['./demande-adhesion.component.css']
})
export class DemandeAdhesionComponent implements OnInit {

  StatutDemande = StatutDemande;

  // Données
  allTeams: Team[] = [];
  myTeams: Team[] = [];
  mesDemandes: DemandeAdhesion[] = [];
  demandesRecues: DemandeAdhesion[] = [];

  // Formulaire
  selectedTeamId: string = '';

  // Vue capitaine
  selectedTeamForCaptain: string = '';
  isCaptainOfAnyTeam = false;

  // UI
  activeView: 'joueur' | 'capitaine' = 'joueur';
  loading = false;
  successMsg = '';
  errorMsg = '';

  currentUserId = '';

  constructor(
    private demandeService: DemandeAdhesionService,
    private teamService: TeamService,
    private memberService: TeamMemberService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadData();
  }

  loadData() {
    this.loading = true;
    // Charger toutes les équipes
    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.allTeams = teams;
        // Filtrer mes équipes où je suis capitaine
        this.myTeams = teams.filter(t => t.creatorId === this.currentUserId);
        this.isCaptainOfAnyTeam = this.myTeams.length > 0;
        if (this.myTeams.length > 0) {
          this.selectedTeamForCaptain = this.myTeams[0].teamId!;
          this.loadDemandesRecues();
        }
        this.loading = false;
      },
      error: () => { this.showError('Erreur chargement'); this.loading = false; }
    });

    // Charger mes demandes
    this.demandeService.getMyDemandes(this.currentUserId).subscribe({
      next: (data) => this.mesDemandes = data,
      error: () => {}
    });
  }

  loadDemandesRecues() {
    if (!this.selectedTeamForCaptain) return;
    this.demandeService.getDemandesByTeam(this.selectedTeamForCaptain).subscribe({
      next: (data) => this.demandesRecues = data,
      error: () => this.showError('Erreur chargement demandes')
    });
  }

  onCaptainTeamChange() {
    this.demandesRecues = [];
    this.loadDemandesRecues();
  }

  // Vue joueur — envoyer demande
  envoyerDemande() {
    if (!this.selectedTeamId || !this.currentUserId) return;
    // Vérifier si déjà une demande en attente
    const dejaEnvoyee = this.mesDemandes.find(
      d => d.teamId === this.selectedTeamId && d.statut === StatutDemande.PENDING
    );
    if (dejaEnvoyee) {
      this.showError('Vous avez déjà une demande en attente pour cette équipe');
      return;
    }
    this.loading = true;
    this.demandeService.rejoindreEquipe(this.selectedTeamId, this.currentUserId).subscribe({
      next: (d) => {
        this.mesDemandes.unshift(d);
        this.selectedTeamId = '';
        this.showSuccess('Demande envoyée ! En attente de validation.');
        this.loading = false;
      },
      error: () => { this.showError('Erreur envoi demande'); this.loading = false; }
    });
  }

  // Vue capitaine — accepter
  accepter(demande: DemandeAdhesion) {
    if (!demande.demandeId) return;
    this.demandeService.accepterDemande(demande.demandeId, this.currentUserId).subscribe({
      next: (updated) => {
        const idx = this.demandesRecues.findIndex(d => d.demandeId === updated.demandeId);
        if (idx !== -1) this.demandesRecues[idx] = updated;
        this.showSuccess('Demande acceptée ! Le joueur est maintenant membre.');
      },
      error: () => this.showError('Erreur acceptation')
    });
  }

  // Vue capitaine — refuser
  refuser(demande: DemandeAdhesion) {
    if (!demande.demandeId) return;
    this.demandeService.refuserDemande(demande.demandeId, this.currentUserId).subscribe({
      next: (updated) => {
        const idx = this.demandesRecues.findIndex(d => d.demandeId === updated.demandeId);
        if (idx !== -1) this.demandesRecues[idx] = updated;
        this.showSuccess('Demande refusée.');
      },
      error: () => this.showError('Erreur refus')
    });
  }

  // Équipes disponibles (pas encore membre)
  get equipesDisponibles(): Team[] {
    return this.allTeams.filter(t => t.creatorId !== this.currentUserId);
  }

  get demandesEnAttente(): DemandeAdhesion[] {
    return this.demandesRecues.filter(d => d.statut === StatutDemande.PENDING);
  }

  get countMesDemandes(): Record<string, number> {
    return {
      pending:  this.mesDemandes.filter(d => d.statut === StatutDemande.PENDING).length,
      accepted: this.mesDemandes.filter(d => d.statut === StatutDemande.ACCEPTED).length,
      rejected: this.mesDemandes.filter(d => d.statut === StatutDemande.REJECTED).length,
    };
  }

  getStatutLabel(statut: StatutDemande): string {
    return {
      [StatutDemande.PENDING]:  'En attente',
      [StatutDemande.ACCEPTED]: 'Acceptée',
      [StatutDemande.REJECTED]: 'Refusée'
    }[statut];
  }

  getTeamName(teamId: string): string {
    return this.allTeams.find(t => t.teamId === teamId)?.name || teamId;
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 4000);
  }

  private showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 4000);
  }
}
