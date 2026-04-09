import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/services/Team/team.service'; // adapte chemin
import { Team } from 'src/app/Core/Models/Teams/Team'; // adapte le chemin si besoin

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  teams: Team[] = [];
  selectedTeam: Team | null = null; // pour modal détails
  editingTeam: Team | null = null;  // pour modal édition

  newTeam: Team = {
    name: '',
    sport: '',
    city: '',
    description: '',
    capacityMax: 0
  };

  creatorId = '123'; // temporaire
  loading = false;

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  // 🔹 Charger toutes les teams
  loadTeams() {
    this.loading = true;
    this.teamService.getAllTeams().subscribe({
      next: (data) => {
        this.teams = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur getAll:', err);
        this.loading = false;
      }
    });
  }

  // 🔹 Créer une team
  createTeam() {
    if (!this.newTeam.name || !this.newTeam.sport) {
      alert('Nom et sport sont obligatoires');
      return;
    }

    this.teamService.createTeam(this.newTeam, this.creatorId).subscribe({
      next: (team) => {
        console.log('Team créée:', team);
        this.loadTeams();

        // reset formulaire
        this.newTeam = { name: '', sport: '', city: '', description: '', capacityMax: 0 };
      },
      error: (err) => console.error('Erreur create:', err)
    });
  }

  // 🔹 Sélection pour voir détails
  viewTeam(teamId: string) {
    this.teamService.getTeamById(teamId).subscribe({
      next: (team) => this.selectedTeam = team,
      error: (err) => console.error('Erreur getById:', err)
    });
  }

  // 🔹 Fermer détails
  closeDetails() {
    this.selectedTeam = null;
  }

  // 🔥 Sélection pour édition
  editTeam(team: Team) {
    this.editingTeam = { ...team }; // clone
  }

  // 🔥 Annuler édition
  cancelEdit() {
    this.editingTeam = null;
  }

  // 🔥 Update
  updateTeam() {
    if (!this.editingTeam || !this.editingTeam.teamId) return;

    this.teamService.updateTeam(this.editingTeam.teamId, this.editingTeam)
      .subscribe(() => {
        this.editingTeam = null;
        this.loadTeams();
      });
  }

  // 🔥 Delete
  deleteTeam(id: string) {
    this.teamService.deleteTeam(id)
      .subscribe(() => this.loadTeams());
  }

}
