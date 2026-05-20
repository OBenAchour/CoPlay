import { Component, OnInit } from '@angular/core';
import { TeamService }  from '../../services/Team/team.service';
import { AuthService }  from '../../Core/Services/Auth/auth.service';
import { Team }         from '../../Core/Models/Teams/Team';

export type ActionType =
  | 'team_created'
  | 'member_joined'
  | 'member_left'
  | 'role_changed'
  | 'sponsor_added'
  | 'match_played'
  | 'coach_assigned';

export interface HistoriqueEntry {
  id: string;
  type: ActionType;
  teamId: string;
  teamName: string;
  label: string;
  detail: string;
  date: string;   // ISO string
  actor: string;  // userId or name
}

const STORAGE_KEY = 'cp_historique_actions';

const ACTION_META: Record<ActionType, { icon: string; color: string }> = {
  team_created:  { icon: '🏟️', color: '#0AADE3' },
  member_joined: { icon: '➕', color: '#16a34a' },
  member_left:   { icon: '➖', color: '#dc2626' },
  role_changed:  { icon: '🔄', color: '#d97706' },
  sponsor_added: { icon: '🤝', color: '#F47920' },
  match_played:  { icon: '⚽', color: '#7c3aed' },
  coach_assigned:{ icon: '📋', color: '#0891c2' },
};

@Component({
  selector: 'app-historique-action',
  templateUrl: './historique-action.component.html',
  styleUrls: ['./historique-action.component.css']
})
export class HistoriqueActionComponent implements OnInit {

  entries: HistoriqueEntry[] = [];
  filtered: HistoriqueEntry[] = [];
  teams: Team[]               = [];
  loading                     = true;

  filterTeam   = '';
  filterType   = '';
  filterSearch = '';

  showModal   = false;
  formEntry: Partial<HistoriqueEntry> = {};
  formError = '';

  readonly actionTypes: ActionType[] = Object.keys(ACTION_META) as ActionType[];

  constructor(
    private teamSvc: TeamService,
    private auth:    AuthService
  ) {}

  ngOnInit(): void {
    this.entries = this.loadEntries();
    this.teamSvc.getAllTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        // Auto-seed one entry per team if history is empty
        if (this.entries.length === 0 && teams.length > 0) {
          this.seedFromTeams(teams);
        }
        this.loading = false;
        this.applyFilters();
      },
      error: () => { this.loading = false; this.applyFilters(); }
    });
  }

  // ─── Seed demo data ─────────────────────────────────────
  private seedFromTeams(teams: Team[]): void {
    const now = new Date();
    teams.forEach((t, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 3);
      this.entries.push({
        id:       `seed_${t.teamId}_create`,
        type:     'team_created',
        teamId:   t.teamId ?? '',
        teamName: t.name,
        label:    'Équipe créée',
        detail:   `L'équipe "${t.name}" (${t.sport}) a été créée.`,
        date:     d.toISOString(),
        actor:    this.auth.getUserId(),
      });
    });
    this.saveEntries();
  }

  // ─── Storage ─────────────────────────────────────────────
  private loadEntries(): HistoriqueEntry[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  private saveEntries(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
  }

  // ─── Filters ─────────────────────────────────────────────
  applyFilters(): void {
    let list = [...this.entries];
    if (this.filterTeam)   list = list.filter(e => e.teamId === this.filterTeam);
    if (this.filterType)   list = list.filter(e => e.type   === this.filterType);
    if (this.filterSearch) {
      const q = this.filterSearch.toLowerCase();
      list = list.filter(e =>
        e.label.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q) ||
        e.teamName.toLowerCase().includes(q)
      );
    }
    // Most recent first
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.filtered = list;
  }

  resetFilters(): void {
    this.filterTeam = this.filterType = this.filterSearch = '';
    this.applyFilters();
  }

  // ─── Add entry ───────────────────────────────────────────
  openAdd(): void {
    this.formEntry = { date: new Date().toISOString().substring(0, 16) };
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  submit(): void {
    if (!this.formEntry.teamId)         { this.formError = 'Sélectionnez une équipe.'; return; }
    if (!this.formEntry.type)           { this.formError = 'Sélectionnez un type d\'action.'; return; }
    if (!this.formEntry.label?.trim())  { this.formError = 'Titre requis.'; return; }

    const team = this.teams.find(t => t.teamId === this.formEntry.teamId);
    const entry: HistoriqueEntry = {
      id:       Date.now().toString(),
      type:     this.formEntry.type!,
      teamId:   this.formEntry.teamId!,
      teamName: team?.name ?? '',
      label:    this.formEntry.label!.trim(),
      detail:   this.formEntry.detail?.trim() ?? '',
      date:     this.formEntry.date
                  ? new Date(this.formEntry.date).toISOString()
                  : new Date().toISOString(),
      actor:    this.auth.getUserId(),
    };

    this.entries.unshift(entry);
    this.saveEntries();
    this.applyFilters();
    this.closeModal();
  }

  // ─── Delete ──────────────────────────────────────────────
  delete(id: string): void {
    if (!confirm('Supprimer cette entrée ?')) return;
    this.entries = this.entries.filter(e => e.id !== id);
    this.saveEntries();
    this.applyFilters();
  }

  // ─── Helpers ─────────────────────────────────────────────
  iconFor(type: ActionType):  string { return ACTION_META[type]?.icon  ?? '📌'; }
  colorFor(type: ActionType): string { return ACTION_META[type]?.color ?? '#6b7280'; }

  labelFor(type: ActionType): string {
    const labels: Record<ActionType, string> = {
      team_created:   'Équipe créée',
      member_joined:  'Membre rejoint',
      member_left:    'Membre parti',
      role_changed:   'Rôle modifié',
      sponsor_added:  'Sponsor ajouté',
      match_played:   'Match joué',
      coach_assigned: 'Coach assigné',
    };
    return labels[type] ?? type;
  }

  groupDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)   return 'À l\'instant';
    if (m < 60)  return `Il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `Il y a ${h}h`;
    const day = Math.floor(h / 24);
    if (day < 7) return `Il y a ${day}j`;
    return new Date(iso).toLocaleDateString('fr-FR');
  }
}
