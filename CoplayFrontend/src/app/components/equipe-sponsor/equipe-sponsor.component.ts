import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../services/Team/team.service';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { Team } from '../../Core/Models/Teams/Team';

export interface Sponsor {
  id: string;
  teamId: string;
  teamName: string;
  name: string;
  logoUrl: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const STORAGE_KEY = 'cp_team_sponsors';

@Component({
  selector: 'app-equipe-sponsor',
  templateUrl: './equipe-sponsor.component.html',
  styleUrls: ['./equipe-sponsor.component.css']
})
export class EquipeSponsorComponent implements OnInit {

  teams: Team[]     = [];
  sponsors: Sponsor[] = [];
  loading           = true;

  showModal   = false;
  editingId: string | null = null;

  form: Partial<Sponsor> = {};
  formError = '';

  constructor(
    private teamSvc: TeamService,
    private auth:    AuthService
  ) {}

  ngOnInit(): void {
    this.sponsors = this.loadSponsors();
    this.teamSvc.getAllTeams().subscribe({
      next:  (teams) => { this.teams = teams; this.loading = false; },
      error: ()      => { this.loading = false; }
    });
  }

  // ─── Storage ────────────────────────────────────────────
  private loadSponsors(): Sponsor[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  private saveSponsors(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sponsors));
  }

  // ─── Modal ──────────────────────────────────────────────
  openAdd(): void {
    this.editingId = null;
    this.form      = { currency: 'DT', startDate: this.today(), endDate: '' };
    this.formError = '';
    this.showModal = true;
  }

  openEdit(s: Sponsor): void {
    this.editingId = s.id;
    this.form      = { ...s };
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  // ─── Submit ─────────────────────────────────────────────
  submit(): void {
    if (!this.form.name?.trim())   { this.formError = 'Le nom du sponsor est requis.'; return; }
    if (!this.form.teamId)         { this.formError = 'Veuillez sélectionner une équipe.'; return; }
    if (!this.form.amount || this.form.amount <= 0) { this.formError = 'Montant invalide.'; return; }

    const team = this.teams.find(t => t.teamId === this.form.teamId);

    if (this.editingId) {
      const idx = this.sponsors.findIndex(s => s.id === this.editingId);
      if (idx !== -1) {
        this.sponsors[idx] = {
          ...this.sponsors[idx],
          ...this.form,
          teamName: team?.name ?? '',
        } as Sponsor;
      }
    } else {
      const newSponsor: Sponsor = {
        id:        Date.now().toString(),
        teamId:    this.form.teamId!,
        teamName:  team?.name ?? '',
        name:      this.form.name!.trim(),
        logoUrl:   this.form.logoUrl?.trim() ?? '',
        amount:    this.form.amount!,
        currency:  this.form.currency ?? 'DT',
        startDate: this.form.startDate ?? '',
        endDate:   this.form.endDate ?? '',
        notes:     this.form.notes?.trim() ?? '',
      };
      this.sponsors.unshift(newSponsor);
    }

    this.saveSponsors();
    this.closeModal();
  }

  // ─── Delete ─────────────────────────────────────────────
  delete(id: string): void {
    if (!confirm('Supprimer ce sponsor ?')) return;
    this.sponsors = this.sponsors.filter(s => s.id !== id);
    this.saveSponsors();
  }

  // ─── Helpers ────────────────────────────────────────────
  private today(): string {
    return new Date().toISOString().substring(0, 10);
  }

  initials(name: string): string {
    return (name || '?').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  totalAmount(teamId: string): number {
    return this.sponsors
      .filter(s => s.teamId === teamId)
      .reduce((sum, s) => sum + (s.amount || 0), 0);
  }

  sponsorsForTeam(teamId: string): Sponsor[] {
    return this.sponsors.filter(s => s.teamId === teamId);
  }

  isActive(s: Sponsor): boolean {
    if (!s.endDate) return true;
    return new Date(s.endDate) >= new Date();
  }
}
