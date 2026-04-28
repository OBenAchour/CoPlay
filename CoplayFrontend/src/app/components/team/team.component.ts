import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from 'src/app/services/Team/team.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { Team } from 'src/app/Core/Models/Teams/Team';
import { RoleEquipe } from 'src/app/Core/Models/Teams/RoleEquipe';

export interface SportConfig {
  name: string;
  maxPlayers: number;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  allTeams: Team[] = [];
  myTeams: Team[] = [];
  activeTab: 'all' | 'mine' = 'all';

  showCreateForm = false;
  editingTeam: Team | null = null;
  selectedTeam: Team | null = null;

  sports: SportConfig[] = [
    { name: 'Football', maxPlayers: 11 },
    { name: 'Basketball', maxPlayers: 5 },
    { name: 'Volleyball', maxPlayers: 6 },
    { name: 'Handball', maxPlayers: 7 },
    { name: 'Tennis', maxPlayers: 2 },
    { name: 'Badminton', maxPlayers: 2 },
    { name: 'Rugby', maxPlayers: 15 },
    { name: 'Hockey', maxPlayers: 11 },
    { name: 'Baseball', maxPlayers: 9 },
    { name: 'Softball', maxPlayers: 10 },
    { name: 'Cricket', maxPlayers: 11 },
    { name: 'Water Polo', maxPlayers: 7 },
    { name: 'Futsal', maxPlayers: 5 },
    { name: 'Beach Volleyball', maxPlayers: 2 },
    { name: 'Ultimate Frisbee', maxPlayers: 7 },
    { name: 'Lacrosse', maxPlayers: 10 },
    { name: 'Cycling', maxPlayers: 9 },
    { name: 'Swimming', maxPlayers: 6 },
    { name: 'Athletics', maxPlayers: 8 },
    { name: 'Table Tennis', maxPlayers: 2 }
  ];

  selectedSport: SportConfig | null = null;

  newTeam: Partial<Team> = {
    name: '',
    sport: '',
    city: '',
    description: '',
    capacityMax: undefined
  };

  loading = false;
  successMsg = '';
  errorMsg = '';
  currentUserId = '';

  constructor(
    private teamService: TeamService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadAllTeams();
  }

  loadAllTeams() {
    this.loading = true;
    this.teamService.getAllTeams().subscribe({
      next: (data) => {
        this.allTeams = data;
        this.myTeams = data.filter(t => t.creatorId === this.currentUserId);
        this.loading = false;
      },
      error: () => { this.showError('Erreur chargement équipes'); this.loading = false; }
    });
  }

  loadMyTeams() {
    this.myTeams = this.allTeams.filter(t => t.creatorId === this.currentUserId);
  }

  onSportChange(sportName: string) {
    this.selectedSport = this.sports.find(s => s.name === sportName) || null;
    if (this.selectedSport) {
      this.newTeam.sport = this.selectedSport.name;
      this.newTeam.capacityMax = this.selectedSport.maxPlayers;
    }
  }

  getSportMaxPlayers(sportName: string): number {
    const sport = this.sports.find(s => s.name === sportName);
    return sport ? sport.maxPlayers : 99;
  }

  get displayedTeams(): Team[] {
    return this.activeTab === 'mine' ? this.myTeams : this.allTeams;
  }

  isMyTeam(team: Team): boolean {
    return team.creatorId === this.currentUserId;
  }

  goToDetail(teamId: string) {
    this.router.navigate(['/team', teamId]);
  }

  createTeam() {
    if (!this.newTeam.name || !this.newTeam.sport) {
      this.showError('Nom et sport sont obligatoires');
      return;
    }
    const maxPlayers = this.getSportMaxPlayers(this.newTeam.sport);
    if (this.newTeam.capacityMax && this.newTeam.capacityMax > maxPlayers) {
      this.showError(`Le nombre max de joueurs pour ${this.newTeam.sport} est de ${maxPlayers}`);
      return;
    }
    this.loading = true;
    this.teamService.createTeam(this.newTeam, this.currentUserId).subscribe({
      next: (team) => {
        this.allTeams.unshift(team);
        this.myTeams.unshift(team);
        this.newTeam = { name: '', sport: '', city: '', description: '', capacityMax: undefined };
        this.selectedSport = null;
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

  editTeam(team: Team) { this.editingTeam = { ...team }; }

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
