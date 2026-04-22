import { Component, OnInit } from '@angular/core';
import { CoachService } from 'src/app/services/Coach/coach.service';
import { TeamService } from 'src/app/services/Team/team.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { UserService } from 'src/app/Core/Services/User/user.service';
import { PropositionCoach } from 'src/app/Core/Models/Teams/PropositionCoach';
import { StatutDemande } from 'src/app/Core/Models/Teams/StatutDemande';
import { Team } from 'src/app/Core/Models/Teams/Team';

@Component({
  selector: 'app-coach',
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.css']
})
export class CoachComponent implements OnInit {

  StatutDemande = StatutDemande;

  // Données
  allTeams: Team[] = [];
  myTeams: Team[] = [];
  mesPropositionsRecues: PropositionCoach[] = [];
  propositionsEnvoyees: PropositionCoach[] = [];

  // Formulaire capitaine
  selectedTeamId: string = '';
  searchQuery: string = '';
  searchResults: any[] = [];
  selectedCoach: any = null;
  searchLoading = false;
  searchDone = false;

  // UI
  activeView: 'recues' | 'envoyees' = 'recues';
  isCaptain = false;
  loading = false;
  successMsg = '';
  errorMsg = '';

  currentUserId = '';

  constructor(
    private coachService: CoachService,
    private teamService: TeamService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    this.currentUserId = user.userId; // ✅ IMPORTANT

    console.log("COACH ID =", this.currentUserId);

    this.loadData();
  }


  loadData() {
    this.loading = true;

    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.allTeams = teams;
        this.myTeams = teams.filter(t => t.creatorId === this.currentUserId);
        this.isCaptain = this.myTeams.length > 0;
        if (this.myTeams.length > 0) {
          this.selectedTeamId = this.myTeams[0].teamId!;
          this.loadPropositionsEnvoyees();
        }
        this.loading = false;
      },
      error: () => { this.showError('Erreur chargement'); this.loading = false; }
    });

    // Propositions reçues en tant que coach
    this.coachService.getMesPropositions(this.currentUserId).subscribe({
      next: (data) => {
        console.log("PROPOSITIONS RECUES =", data);
        this.mesPropositionsRecues = data;
      }
    });

  }

  loadPropositionsEnvoyees() {
    if (!this.selectedTeamId) return;
    this.coachService.getPropositionsByTeam(this.selectedTeamId).subscribe({
      next: (data) => this.propositionsEnvoyees = data,
      error: () => {}
    });
  }

  onTeamChange() {
    this.propositionsEnvoyees = [];
    this.loadPropositionsEnvoyees();
  }

  // Recherche coach
  searchUsers() {
    if (!this.searchQuery.trim() || this.searchQuery.length < 2) return;
    this.searchLoading = true;
    this.searchDone = false;
    this.selectedCoach = null;
    this.userService.searchUsers(this.searchQuery).subscribe({
      next: (users) => {
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

  selectCoach(user: any) {
    this.selectedCoach = user;
    this.searchQuery = user.profile?.displayName || user.email;
    this.searchResults = [];
  }

  clearSearch() {
    this.selectedCoach = null;
    this.searchQuery = '';
    this.searchResults = [];
    this.searchDone = false;
  }

  // Capitaine — proposer un coach
  proposer() {
    if (!this.selectedCoach || !this.selectedTeamId) return;
    this.loading = true;
    this.coachService.proposerCoach(
      this.selectedTeamId,
      this.selectedCoach.userId
    ).subscribe({
      next: (prop) => {
        this.propositionsEnvoyees.unshift(prop);
        this.clearSearch();
        this.showSuccess('Proposition envoyée au coach !');
        this.loading = false;
      },
      error: () => { this.showError('Erreur envoi proposition'); this.loading = false; }
    });
  }

  // Coach — accepter proposition
  accepter(prop: PropositionCoach) {
    if (!prop.propositionId) return;
    this.coachService.accepterProposition(prop.propositionId).subscribe({
      next: (updated) => {
        const idx = this.mesPropositionsRecues.findIndex(p => p.propositionId === updated.propositionId);
        if (idx !== -1) this.mesPropositionsRecues[idx] = updated;
        this.showSuccess('Proposition acceptée ! Vous êtes maintenant coach de cette équipe.');
      },
      error: () => this.showError('Erreur acceptation')
    });
  }

  // Coach — refuser proposition
  refuser(prop: PropositionCoach) {
    if (!prop.propositionId) return;
    this.coachService.refuserProposition(prop.propositionId).subscribe({
      next: (updated) => {
        const idx = this.mesPropositionsRecues.findIndex(p => p.propositionId === updated.propositionId);
        if (idx !== -1) this.mesPropositionsRecues[idx] = updated;
        this.showSuccess('Proposition refusée.');
      },
      error: () => this.showError('Erreur refus')
    });
  }

  get propositionsEnAttente(): PropositionCoach[] {
    return this.mesPropositionsRecues.filter(p => p.statut === StatutDemande.PENDING);
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

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 4000);
  }

  private showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 4000);
  }
}
