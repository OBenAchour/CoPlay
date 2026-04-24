import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../services/Team/team.service';
import { Team } from '../../Core/Models/Teams/Team';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  teams: Team[] = [];
  selectedTeam: Team | null = null;
  editingTeam: Team | null = null;

  newTeam: Team = {
    name: '',
    sport: '',
    city: '',
    description: '',
    capacityMax: 0
  };

  creatorId = '123';
  loading = false;

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams() {
    this.loading = true;
    this.teamService.getAllTeams().subscribe({
      next: (data: any) => { // <--- AJOUTÉ :any
        this.teams = data;
        this.loading = false;
      },
      error: (err: any) => { // <--- AJOUTÉ :any
        console.error('Erreur getAll:', err);
        this.loading = false;
      }
    });
  }

  createTeam() {
    if (!this.newTeam.name || !this.newTeam.sport) {
      alert('Nom et sport sont obligatoires');
      return;
    }

    this.teamService.createTeam(this.newTeam, this.creatorId).subscribe({
      next: (team: any) => { // <--- AJOUTÉ :any
        console.log('Team créée:', team);
        this.loadTeams();
        this.newTeam = { name: '', sport: '', city: '', description: '', capacityMax: 0 };
      },
      error: (err: any) => console.error('Erreur create:', err) // <--- AJOUTÉ :any
    });
  }

  viewTeam(teamId: string) {
    this.teamService.getTeamById(teamId).subscribe({
      next: (team: any) => this.selectedTeam = team, // <--- AJOUTÉ :any
      error: (err: any) => console.error('Erreur getById:', err) // <--- AJOUTÉ :any
    });
  }

  closeDetails() {
    this.selectedTeam = null;
  }

  editTeam(team: Team) {
    this.editingTeam = { ...team };
  }

  cancelEdit() {
    this.editingTeam = null;
  }

  updateTeam() {
    if (!this.editingTeam || !this.editingTeam.teamId) return;

    this.teamService.updateTeam(this.editingTeam.teamId, this.editingTeam)
      .subscribe({
        next: () => { // On peut laisser vide ou mettre ()
          this.editingTeam = null;
          this.loadTeams();
        },
        error: (err: any) => console.error(err) // <--- AJOUTÉ :any
      });
  }

  deleteTeam(id: string) {
    this.teamService.deleteTeam(id)
      .subscribe({
        next: () => this.loadTeams(),
        error: (err: any) => console.error(err) // <--- AJOUTÉ :any
      });
  }
}