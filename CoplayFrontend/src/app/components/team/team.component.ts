import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/services/Team/team.service';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { Team } from 'src/app/Core/Models/Teams/Team';
import { TeamStatus } from 'src/app/Core/Models/Teams/TeamStatus';



@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  // Données
  allTeams: Team[] = [];
  myTeams: Team[] = [];
  selectedTeam: Team | null = null;
  editingTeam: Team | null = null;

  // Formulaire création
  newTeam: Team = {
    name: '', sport: '', city: '', description: '', capacityMax: 0
  };

  // UI
  activeTab: 'all' | 'mine' = 'all';
  loading = false;
  showCreateForm = false;
  successMsg = '';
  errorMsg = '';

  currentUserId = '';

  constructor(
    private teamService: TeamService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadAllTeams();
    this.loadMyTeams();
  }

  loadAllTeams() {
    this.loading = true;
    this.teamService.getAllTeams().subscribe({
      next: (data) => { this.allTeams = data; this.loading = false; },
      error: () => { this.showError('Erreur chargement équipes'); this.loading = false; }
    });
  }

  loadMyTeams() {
    if (!this.currentUserId) return;
    this.teamService.getMyTeams(this.currentUserId).subscribe({
      next: (data) => this.myTeams = data,
      error: () => {}
    });
  }

  get displayedTeams(): Team[] {
    return this.activeTab === 'mine' ? this.myTeams : this.allTeams;
  }

  isMyTeam(team: Team): boolean {
    return team.creatorId === this.currentUserId;
  }

  createTeam() {
    if (!this.newTeam.name || !this.newTeam.sport) {
      this.showError('Nom et sport sont obligatoires');
      return;
    }
    this.loading = true;
    this.teamService.createTeam(this.newTeam, this.currentUserId).subscribe({
      next: (team) => {
        this.allTeams.unshift(team);
        this.myTeams.unshift(team);
        this.newTeam = { name: '', sport: '', city: '', description: '', capacityMax: 0 };
        this.showCreateForm = false;
        this.showSuccess('Équipe créée ! Vous êtes maintenant capitaine.');
        this.loading = false;
      },
      error: () => { this.showError('Erreur création équipe'); this.loading = false; }
    });
  }

  viewTeam(teamId: string) {
    this.teamService.getTeamById(teamId).subscribe({
      next: (team) => this.selectedTeam = team,
      error: () => this.showError('Erreur chargement équipe')
    });
  }

  editTeam(team: Team) {
    this.editingTeam = { ...team };
  }

  updateTeam() {
    if (!this.editingTeam?.teamId) return;
    this.teamService.updateTeam(this.editingTeam.teamId, this.editingTeam).subscribe({
      next: (updated) => {
        const idx = this.allTeams.findIndex(t => t.teamId === updated.teamId);
        if (idx !== -1) this.allTeams[idx] = updated;
        const idx2 = this.myTeams.findIndex(t => t.teamId === updated.teamId);
        if (idx2 !== -1) this.myTeams[idx2] = updated;
        this.editingTeam = null;
        this.showSuccess('Équipe modifiée !');
      },
      error: () => this.showError('Erreur modification')
    });
  }

  deleteTeam(id: string) {
    this.teamService.deleteTeam(id).subscribe({
      next: () => {
        this.allTeams = this.allTeams.filter(t => t.teamId !== id);
        this.myTeams = this.myTeams.filter(t => t.teamId !== id);
        this.showSuccess('Équipe supprimée !');
      },
      error: () => this.showError('Erreur suppression')
    });
  }

  closeDetails() { this.selectedTeam = null; }
  cancelEdit() { this.editingTeam = null; }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }

  private showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 3000);
  }
}
