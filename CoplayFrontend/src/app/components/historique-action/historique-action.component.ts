import { Component, OnInit } from '@angular/core';
import { HistoriqueActionService } from 'src/app/services/HistoriqueAction/historique-action.service';
import { TeamService } from 'src/app/services/Team/team.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { HistoriqueAction } from 'src/app/Core/Models/Teams/HistoriqueAction';
import { Team } from 'src/app/Core/Models/Teams/Team';

@Component({
  selector: 'app-historique-action',
  templateUrl: './historique-action.component.html',
  styleUrls: ['./historique-action.component.css']
})
export class HistoriqueActionComponent implements OnInit {

  teams: Team[] = [];
  actions: HistoriqueAction[] = [];
  selectedTeamId: string = '';
  selectedTeamName: string = '';
  newAction: string = '';
  actorId: string = '';
  loading = false;
  successMsg = '';
  errorMsg = '';
  searchText: string = '';

  actionSuggestions: string[] = [
    'Membre ajouté',
    'Membre retiré',
    'Coach proposé',
    'Match planifié',
    'Entraînement annulé',
    'Capitaine changé',
    'Invitation envoyée',
    'Demande acceptée',
  ];

  constructor(
    private historiqueService: HistoriqueActionService,
    private teamService: TeamService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.actorId = this.authService.getUserId();
    this.loadTeams();
  }

  loadTeams() {
    this.teamService.getAllTeams().subscribe({
      next: (data) => {
        this.teams = data;
        if (data.length > 0) {
          this.selectedTeamId = data[0].teamId!;
          this.selectedTeamName = data[0].name;
          this.loadActions();
        }
      },
      error: () => this.showError('Erreur chargement équipes')
    });
  }

  loadActions() {
    if (!this.selectedTeamId) return;
    this.loading = true;
    this.historiqueService.getActions(this.selectedTeamId).subscribe({
      next: (data) => {
        this.actions = data.sort((a, b) =>
          new Date(b.performedAt || '').getTime() - new Date(a.performedAt || '').getTime()
        );
        this.loading = false;
      },
      error: () => {
        this.showError('Erreur chargement actions');
        this.loading = false;
      }
    });
  }

  onTeamChange() {
    const team = this.teams.find(t => t.teamId === this.selectedTeamId);
    this.selectedTeamName = team?.name || '';
    this.actions = [];
    this.loadActions();
  }

  addAction() {
    if (!this.newAction.trim() || !this.selectedTeamId) return;
    this.loading = true;
    const action: HistoriqueAction = {
      teamId: this.selectedTeamId,
      actorId: this.actorId,
      action: this.newAction.trim(),
      performedAt: new Date().toISOString()
    };
    this.historiqueService.addAction(this.selectedTeamId, action).subscribe({
      next: (saved) => {
        this.actions.unshift(saved);
        this.newAction = '';
        this.showSuccess('Action enregistrée !');
        this.loading = false;
      },
      error: () => {
        this.showError('Erreur lors de l\'enregistrement');
        this.loading = false;
      }
    });
  }

  useSuggestion(s: string) {
    this.newAction = s;
  }

  get actionsFiltrees(): HistoriqueAction[] {
    if (!this.searchText.trim()) return this.actions;
    return this.actions.filter(a =>
      a.action.toLowerCase().includes(this.searchText.toLowerCase()) ||
      a.actorId.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  getInitiales(id: string): string {
    return id ? id.substring(0, 2).toUpperCase() : '??';
  }

  getActionIcon(action: string): string {
    if (action.toLowerCase().includes('ajout')) return '+';
    if (action.toLowerCase().includes('retir') || action.toLowerCase().includes('supprim')) return '-';
    if (action.toLowerCase().includes('coach')) return 'C';
    if (action.toLowerCase().includes('match') || action.toLowerCase().includes('planif')) return 'M';
    if (action.toLowerCase().includes('invit')) return 'I';
    if (action.toLowerCase().includes('accept')) return 'A';
    if (action.toLowerCase().includes('annul')) return 'X';
    if (action.toLowerCase().includes('capit')) return 'K';
    return '•';
  }

  getIconClass(action: string): string {
    if (action.toLowerCase().includes('ajout') || action.toLowerCase().includes('accept')) return 'icon-green';
    if (action.toLowerCase().includes('retir') || action.toLowerCase().includes('annul') || action.toLowerCase().includes('supprim')) return 'icon-red';
    if (action.toLowerCase().includes('coach')) return 'icon-blue';
    if (action.toLowerCase().includes('match') || action.toLowerCase().includes('planif')) return 'icon-purple';
    if (action.toLowerCase().includes('invit')) return 'icon-orange';
    return 'icon-gray';
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }

  private showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 3000);
  }
}
