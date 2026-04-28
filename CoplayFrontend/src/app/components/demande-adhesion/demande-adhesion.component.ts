import { Component, OnInit } from '@angular/core';
import { DemandeAdhesionService } from 'src/app/services/DemandeAdhesion/demande-adhesion.service';
import { InvitationService } from 'src/app/services/Invitation/invitation.service';
import { TeamService } from 'src/app/services/Team/team.service';
import { TeamMemberService } from 'src/app/services/TeamMember/team-member.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { UserService } from 'src/app/Core/Services/User/user.service';
import { DemandeAdhesion } from 'src/app/Core/Models/Teams/DemandeAdhesion';
import { Invitation } from 'src/app/Core/Models/Teams/Invitation';
import { StatutDemande } from 'src/app/Core/Models/Teams/StatutDemande';
import { RoleEquipe } from 'src/app/Core/Models/Teams/RoleEquipe';
import { Team } from 'src/app/Core/Models/Teams/Team';

@Component({
  selector: 'app-demande-adhesion',
  templateUrl: './demande-adhesion.component.html',
  styleUrls: ['./demande-adhesion.component.css']
})
export class DemandeAdhesionComponent implements OnInit {

  StatutDemande = StatutDemande;
  ROLES = ['PLAYER', 'COACH', 'STAFF'] as const;

  // Données
  allTeams: Team[] = [];
  myTeams: Team[] = [];
  mesDemandes: DemandeAdhesion[] = [];
  demandesRecues: DemandeAdhesion[] = [];
  mesInvitations: Invitation[] = [];
  invitationsRecues: Invitation[] = [];
  userNames: Map<string, string> = new Map();

  // Formulaire
  selectedTeamId: string = '';
  selectedRole: RoleEquipe = 'PLAYER';

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
    private invitationService: InvitationService,
    private teamService: TeamService,
    private memberService: TeamMemberService,
    private authService: AuthService,
    private userService: UserService
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

    // Charger mes invitations reçues
    this.invitationService.getMyInvitations(this.currentUserId).subscribe({
      next: (data) => this.mesInvitations = data,
      error: () => {}
    });
  }

  loadDemandesRecues() {
    if (!this.selectedTeamForCaptain) return;
    this.demandeService.getDemandesByTeam(this.selectedTeamForCaptain, this.currentUserId).subscribe({
      next: (data) => {
        this.demandesRecues = data;
        data.forEach(d => {
          if (!this.userNames.has(d.userId)) {
            this.userService.getUserById(d.userId).subscribe({
              next: (user) => {
                this.userNames.set(d.userId, user.profile?.displayName || user.email || d.userId);
              },
              error: () => {
                this.userNames.set(d.userId, d.userId);
              }
            });
          }
        });
      },
      error: () => this.showError('Erreur chargement demandes')
    });
    this.invitationService.getInvitationsByTeam(this.selectedTeamForCaptain).subscribe({
      next: (data) => {
        this.invitationsRecues = data;
        data.forEach(inv => {
          if (!this.userNames.has(inv.invitedUserId)) {
            this.userService.getUserById(inv.invitedUserId).subscribe({
              next: (user) => {
                this.userNames.set(inv.invitedUserId, user.profile?.displayName || user.email || inv.invitedUserId);
              },
              error: () => {
                this.userNames.set(inv.invitedUserId, inv.invitedUserId);
              }
            });
          }
        });
      },
    });
  }

  onCaptainTeamChange() {
    this.demandesRecues = [];
    this.invitationsRecues = [];
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
    this.demandeService.rejoindreEquipe(this.selectedTeamId, this.currentUserId, this.selectedRole).subscribe({
      next: (d) => {
        this.mesDemandes.unshift(d);
        this.selectedTeamId = '';
        this.selectedRole = 'PLAYER';
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

  // Invitations
  get invitationsEnAttente(): Invitation[] {
    return this.mesInvitations.filter(i => i.statut === StatutDemande.PENDING);
  }

  get invitationsTraitees(): Invitation[] {
    return this.mesInvitations.filter(i => i.statut !== StatutDemande.PENDING);
  }

  get invitationsEnvoyeesEnAttente(): Invitation[] {
    return this.invitationsRecues.filter(i => i.statut === StatutDemande.PENDING);
  }

  getRoleLabel(role: RoleEquipe | undefined): string {
    if (!role) return '?';
    return { CAPTAIN:'Capitaine', PLAYER:'Joueur', COACH:'Coach', STAFF:'Staff' }[role];
  }

  getTeamName(teamId: string): string {
    return this.allTeams.find(t => t.teamId === teamId)?.name || 'Équipe';
  }

  getUserName(userId: string): string {
    return this.userNames.get(userId) || userId;
  }

  getInitiales(userId: string): string {
    const name = this.userNames.get(userId);
    return name ? name.substring(0, 2).toUpperCase() : (userId ? userId.substring(0, 2).toUpperCase() : '??');
  }

  acceptInvitation(inv: Invitation) {
    if (!inv.invitationId) return;
    this.loading = true;
    this.invitationService.accepterInvitation(inv.invitationId).subscribe({
      next: (updated) => {
        const idx = this.mesInvitations.findIndex(i => i.invitationId === updated.invitationId);
        if (idx !== -1) this.mesInvitations[idx] = updated;
        this.showSuccess('Invitation acceptée ! Vous êtes maintenant membre.');
        this.loading = false;
      },
      error: () => { this.showError('Erreur acceptation'); this.loading = false; }
    });
  }

  refuseInvitation(inv: Invitation) {
    if (!inv.invitationId) return;
    this.loading = true;
    this.invitationService.refuserInvitation(inv.invitationId).subscribe({
      next: (updated) => {
        const idx = this.mesInvitations.findIndex(i => i.invitationId === updated.invitationId);
        if (idx !== -1) this.mesInvitations[idx] = updated;
        this.showSuccess('Invitation refusée.');
        this.loading = false;
      },
      error: () => { this.showError('Erreur refus'); this.loading = false; }
    });
  }

  supprimerInvitation(inv: Invitation) {
    if (!inv.invitationId) return;
    this.loading = true;
    this.invitationService.deleteInvitation(inv.invitationId).subscribe({
      next: () => {
        this.invitationsRecues = this.invitationsRecues.filter(i => i.invitationId !== inv.invitationId);
        this.showSuccess('Invitation supprimée.');
        this.loading = false;
      },
      error: () => { this.showError('Erreur suppression'); this.loading = false; }
    });
  }

  supprimerDemande(demande: DemandeAdhesion) {
    if (!demande.demandeId) return;
    this.loading = true;
    this.demandeService.deleteDemande(demande.demandeId).subscribe({
      next: () => {
        this.mesDemandes = this.mesDemandes.filter(d => d.demandeId !== demande.demandeId);
        this.showSuccess('Demande supprimée.');
        this.loading = false;
      },
      error: () => { this.showError('Erreur suppression'); this.loading = false; }
    });
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
