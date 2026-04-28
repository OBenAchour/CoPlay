import { Component, OnInit } from '@angular/core';
import { InvitationService } from 'src/app/services/Invitation/invitation.service';
import { TeamService } from 'src/app/services/Team/team.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { UserService } from 'src/app/Core/Services/User/user.service';
import { Invitation } from 'src/app/Core/Models/Teams/Invitation';
import { StatutDemande } from 'src/app/Core/Models/Teams/StatutDemande';
import { RoleEquipe } from 'src/app/Core/Models/Teams/RoleEquipe';
import { Team } from 'src/app/Core/Models/Teams/Team';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.css']
})
export class InvitationComponent implements OnInit {

  StatutDemande = StatutDemande;

  // Données
  allTeams: Team[] = [];
  myTeams: Team[] = [];
  mesInvitations: Invitation[] = [];
  invitationsEnvoyees: Invitation[] = [];
  userNames: Map<string, string> = new Map();

  // Formulaire capitaine
  selectedTeamId: string = '';
  searchQuery: string = '';
  searchResults: any[] = [];
  selectedUser: any = null;
  selectedRole: RoleEquipe = 'PLAYER';
  searchLoading = false;
  searchDone = false;

  roles: RoleEquipe[] = ['PLAYER', 'COACH', 'STAFF'];

  // UI
  activeView: 'recues' | 'envoyees' = 'recues';
  isCaptain = false;
  loading = false;
  successMsg = '';
  errorMsg = '';

  currentUserId = '';

  constructor(
    private invitationService: InvitationService,
    private teamService: TeamService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    console.log("CURRENT USER =", this.currentUserId);
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // Charger toutes les équipes
    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.allTeams = teams;
        this.myTeams = teams.filter(t => t.creatorId === this.currentUserId);
        this.isCaptain = this.myTeams.length > 0;
        if (this.myTeams.length > 0) {
          this.selectedTeamId = this.myTeams[0].teamId!;
          this.loadInvitationsEnvoyees();
        }
        this.loading = false;
      },
      error: () => { this.showError('Erreur chargement'); this.loading = false; }
    });

    // Charger mes invitations reçues
    this.invitationService.getMyInvitations(this.currentUserId).subscribe({
      next: (data) => this.mesInvitations = data,
      error: () => {}
    });
  }

  loadInvitationsEnvoyees() {
    if (!this.selectedTeamId) return;
    this.invitationService.getInvitationsByTeam(this.selectedTeamId).subscribe({
      next: (data) => {
        this.invitationsEnvoyees = data;
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
      error: () => {}
    });
  }

  onTeamChange() {
    this.invitationsEnvoyees = [];
    this.loadInvitationsEnvoyees();
  }

  // Recherche utilisateur pour inviter
  searchUsers() {
    if (!this.searchQuery.trim() || this.searchQuery.length < 2) return;

    this.searchLoading = true;
    this.searchDone = false;
    this.selectedUser = null;

    this.userService.searchUsers(this.searchQuery).subscribe({
      next: (users) => {

        console.log("CURRENT USER =", this.currentUserId);   // 🔥 AJOUTE
        console.log("SEARCH USERS =", users);                // 🔥 AJOUTE

        this.searchResults = users.filter(u => u.userId !== this.currentUserId);

        this.searchLoading = false;
        this.searchDone = true;
      },
      error: () => {
        this.showError('Erreur recherche');
        this.searchLoading = false;
      }
    });
  }


  selectUser(user: any) {
    this.selectedUser = user;
    this.searchQuery = user.profile?.displayName || user.email;
    this.searchResults = [];
  }

  clearSearch() {
    this.selectedUser = null;
    this.searchQuery = '';
    this.searchResults = [];
    this.searchDone = false;
  }

  // Capitaine — envoyer invitation
  envoyerInvitation() {
    if (!this.selectedUser || !this.selectedTeamId) return;
    this.loading = true;
    this.invitationService.inviterUser(
      this.selectedTeamId,
      this.selectedUser.userId,
      this.currentUserId,
      this.selectedRole
    ).subscribe({
      next: (inv) => {
        this.invitationsEnvoyees.unshift(inv);
        this.clearSearch();
        this.selectedRole = 'PLAYER';
        this.showSuccess('Invitation envoyée !');
        this.loading = false;
      },
      error: () => { this.showError('Erreur envoi invitation'); this.loading = false; }
    });
  }

  // Joueur — accepter invitation
  accepter(inv: Invitation) {
    if (!inv.invitationId) return;
    this.invitationService.accepterInvitation(inv.invitationId).subscribe({
      next: (updated) => {
        const idx = this.mesInvitations.findIndex(i => i.invitationId === updated.invitationId);
        if (idx !== -1) this.mesInvitations[idx] = updated;
        this.showSuccess('Invitation acceptée ! Vous êtes maintenant membre.');
      },
      error: () => this.showError('Erreur acceptation')
    });
  }

  // Joueur — refuser invitation
  refuser(inv: Invitation) {
    if (!inv.invitationId) return;
    this.invitationService.refuserInvitation(inv.invitationId).subscribe({
      next: (updated) => {
        const idx = this.mesInvitations.findIndex(i => i.invitationId === updated.invitationId);
        if (idx !== -1) this.mesInvitations[idx] = updated;
        this.showSuccess('Invitation refusée.');
      },
      error: () => this.showError('Erreur refus')
    });
  }

  get invitationsEnAttente(): Invitation[] {
    return this.mesInvitations.filter(i => i.statut === StatutDemande.PENDING);
  }

  getTeamName(teamId: string): string {
    return this.allTeams.find(t => t.teamId === teamId)?.name || teamId;
  }

  getStatutLabel(statut: StatutDemande): string {
    return {
      [StatutDemande.PENDING]:  'En attente',
      [StatutDemande.ACCEPTED]: 'Acceptée',
      [StatutDemande.REJECTED]: 'Refusée'
    }[statut];
  }

  getUserName(userId: string): string {
    return this.userNames.get(userId) || userId;
  }

  getInitiales(userId: string): string {
    const name = this.userNames.get(userId);
    return name ? name.substring(0, 2).toUpperCase() : (userId ? userId.substring(0, 2).toUpperCase() : '??');
  }

  getRoleLabel(role: RoleEquipe): string {
    return { CAPTAIN:'Capitaine', PLAYER:'Joueur', COACH:'Coach', STAFF:'Staff' }[role];
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
