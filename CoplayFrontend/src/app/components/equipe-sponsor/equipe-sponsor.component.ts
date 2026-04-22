import { Component, OnInit } from '@angular/core';
import { EquipeSponsorService } from 'src/app/services/EquipeSponsor/equipe-sponsor.service';
import { TeamService } from 'src/app/services/Team/team.service';
import { EquipeSponsor } from 'src/app/Core/Models/Teams/EquipeSponsor';
import { Team } from 'src/app/Core/Models/Teams/Team';

@Component({
  selector: 'app-equipe-sponsor',
  templateUrl: './equipe-sponsor.component.html',
  styleUrls: ['./equipe-sponsor.component.css']
})
export class EquipeSponsorComponent implements OnInit {

  teams: Team[] = [];
  sponsors: EquipeSponsor[] = [];
  selectedTeamId: string = '';
  selectedTeamName: string = '';

  newSponsorName: string = '';
  newLogoUrl: string = '';
  logoPreview: string = '';

  loading = false;
  successMsg = '';
  errorMsg = '';
  showForm = false;
  confirmDeleteId: string | null = null;

  constructor(
    private sponsorService: EquipeSponsorService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams() {
    this.teamService.getAllTeams().subscribe({
      next: (data) => {
        this.teams = data;
        if (data.length > 0) {
          this.selectedTeamId = data[0].teamId!;
          this.selectedTeamName = data[0].name;
          this.loadSponsors();
        }
      },
      error: () => this.showError('Erreur chargement équipes')
    });
  }

  loadSponsors() {
    if (!this.selectedTeamId) return;
    this.loading = true;
    this.sponsorService.getSponsors(this.selectedTeamId).subscribe({
      next: (data) => {
        this.sponsors = data;
        this.loading = false;
      },
      error: () => {
        this.showError('Erreur chargement sponsors');
        this.loading = false;
      }
    });
  }

  onTeamChange() {
    const team = this.teams.find(t => t.teamId === this.selectedTeamId);
    this.selectedTeamName = team?.name || '';
    this.sponsors = [];
    this.loadSponsors();
  }

  onLogoUrlChange() {
    this.logoPreview = this.newLogoUrl.trim();
  }

  addSponsor() {
    if (!this.newSponsorName.trim() || !this.selectedTeamId) return;
    this.loading = true;
    this.sponsorService.addSponsor(
      this.selectedTeamId,
      this.newSponsorName.trim(),
      this.newLogoUrl.trim()
    ).subscribe({
      next: (s) => {
        this.sponsors.push(s);
        this.newSponsorName = '';
        this.newLogoUrl = '';
        this.logoPreview = '';
        this.showForm = false;
        this.showSuccess('Sponsor ajouté !');
        this.loading = false;
      },
      error: () => {
        this.showError('Erreur lors de l\'ajout');
        this.loading = false;
      }
    });
  }

  confirmDelete(id: string) {
    this.confirmDeleteId = id;
  }

  cancelDelete() {
    this.confirmDeleteId = null;
  }

  removeSponsor(id: string) {
    this.sponsorService.removeSponsor(id).subscribe({
      next: () => {
        this.sponsors = this.sponsors.filter(s => s.id !== id);
        this.confirmDeleteId = null;
        this.showSuccess('Sponsor retiré !');
      },
      error: () => this.showError('Erreur lors de la suppression')
    });
  }

  getInitiales(name: string): string {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  getGradient(name: string): string {
    const gradients = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      'linear-gradient(135deg, #fda085, #f6d365)',
      'linear-gradient(135deg, #84fab0, #8fd3f4)',
    ];
    const idx = name.charCodeAt(0) % gradients.length;
    return gradients[idx];
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
