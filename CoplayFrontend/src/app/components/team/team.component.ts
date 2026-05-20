import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { TeamService }       from '../../services/Team/team.service';
import { TeamMemberService } from '../../services/TeamMember/team-member.service';
import { DemandeAdhesionService } from '../../services/DemandeAdhesion/demande-adhesion.service';
import { AuthService }       from '../../Core/Services/Auth/auth.service';
import { Team }              from '../../Core/Models/Teams/Team';
import { TeamMember }        from '../../Core/Models/Teams/TeamMember';
import { RoleEquipe }        from '../../Core/Models/Teams/RoleEquipe';

type ActiveTab = 'mes-equipes' | 'decouvrir';
type ModalMode = 'detail' | 'gestion' | 'create';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  // ── Données ─────────────────────────────────────────────
  allTeams:  Team[]   = [];
  myTeams:   Team[]   = [];
  otherTeams: Team[]  = [];

  /** Map teamId → rôle du user courant (null = pas membre) */
  myRoles: Record<string, RoleEquipe | null> = {};

  /** Map teamId → liste de membres chargés */
  membersCache: Record<string, TeamMember[]> = {};

  // ── UI ──────────────────────────────────────────────────
  activeTab: ActiveTab = 'mes-equipes';
  loading   = false;
  sending   = '';
  toast     = '';
  toastType: 'success' | 'error' = 'success';

  // ── Modals ──────────────────────────────────────────────
  modalMode:    ModalMode | null = null;
  modalTeam:    Team | null      = null;
  modalMembers: TeamMember[]     = [];
  modalLoading  = false;

  // ── Formulaire création/édition ─────────────────────────
  editForm: Team = { name: '', sport: '', city: '', description: '', capacityMax: 11 };
  formError = '';

  // ── Demandes d'adhésion (côté capitaine) ────────────────
  demandesModal = false;
  demandeTeam: Team | null = null;
  demandes: any[] = [];  // demandes en attente pour une équipe (stockées localement)

  readonly sports = ['Football', 'Basketball', 'Padel', 'Tennis', 'Volleyball', 'Rugby', 'Handball'];
  readonly roles: RoleEquipe[] = ['CAPTAIN', 'PLAYER', 'COACH', 'STAFF'];

  // ── Add member form (dans modal gestion) ────────────────
  newMemberUserId = '';
  newMemberRole: RoleEquipe = 'PLAYER';

  get currentUserId(): string { return this.auth.getUserId(); }

  constructor(
    private teamSvc:     TeamService,
    private memberSvc:   TeamMemberService,
    private demandeSvc:  DemandeAdhesionService,
    private auth:        AuthService
  ) {}

  ngOnInit(): void { this.loadAll(); }

  // ─────────────────────────────────────────────────────────
  // CHARGEMENT
  // ─────────────────────────────────────────────────────────

  loadAll(): void {
    this.loading = true;
    this.teamSvc.getAllTeams().subscribe({
      next: (teams: any) => {
        this.allTeams = teams;
        this.resolveRoles(teams);
      },
      error: () => { this.loading = false; }
    });
  }

  /** Pour chaque équipe, charge les membres et détermine le rôle du user courant */
  private resolveRoles(teams: Team[]): void {
    if (teams.length === 0) { this.loading = false; this.splitTeams(); return; }

    const checks = teams.map(t =>
      this.memberSvc.getMembers(t.teamId!).pipe(
        catchError(() => of([])),
        map((members: TeamMember[]) => ({ teamId: t.teamId!, members }))
      )
    );

    forkJoin(checks).subscribe(results => {
      results.forEach(({ teamId, members }) => {
        this.membersCache[teamId] = members;
        const me = members.find((m: TeamMember) => m.userId === this.currentUserId && m.active !== false);
        this.myRoles[teamId] = me ? me.roleEquipe : null;
      });
      this.splitTeams();
      this.loading = false;
    });
  }

  private splitTeams(): void {
    this.myTeams    = this.allTeams.filter(t => this.myRoles[t.teamId!] !== null && this.myRoles[t.teamId!] !== undefined);
    this.otherTeams = this.allTeams.filter(t => !this.myRoles[t.teamId!]);
    // Affiche directement "Découvrir" si pas encore dans une équipe
    if (this.myTeams.length === 0) this.activeTab = 'decouvrir';
  }

  // ─────────────────────────────────────────────────────────
  // PERMISSIONS
  // ─────────────────────────────────────────────────────────

  isMember(teamId: string):  boolean { return !!this.myRoles[teamId]; }
  isCaptain(teamId: string): boolean { return this.myRoles[teamId] === 'CAPTAIN'; }
  canEdit(teamId: string):   boolean { return this.isCaptain(teamId); }
  canDelete(teamId: string): boolean { return this.isCaptain(teamId); }
  canJoin(teamId: string):   boolean { return !this.isMember(teamId); }

  getMyRoleLabel(teamId: string): string {
    const labels: Record<string, string> = {
      CAPTAIN: '⭐ Capitaine', PLAYER: '👤 Joueur',
      COACH: '📋 Coach',      STAFF: '🔧 Staff'
    };
    return labels[this.myRoles[teamId] || ''] || '';
  }

  // ─────────────────────────────────────────────────────────
  // ACTIONS ÉQUIPE
  // ─────────────────────────────────────────────────────────

  openCreate(): void {
    this.editForm = { name: '', sport: this.sports[0], city: '', description: '', capacityMax: 11 };
    this.formError = '';
    this.modalMode = 'create';
  }

  createTeam(): void {
    if (!this.editForm.name?.trim() || !this.editForm.sport) {
      this.formError = 'Nom et sport sont obligatoires.'; return;
    }
    this.sending = 'create';
    this.teamSvc.createTeam(this.editForm, this.currentUserId).subscribe({
      next: (team: any) => {
        this.sending = '';
        this.modalMode = null;
        this.showToast(`Équipe « ${team.name} » créée !`, 'success');
        this.loadAll();
      },
      error: (err: any) => {
        this.sending = '';
        this.formError = err?.error?.message || 'Erreur lors de la création.';
      }
    });
  }

  openEdit(team: Team): void {
    this.editForm  = { ...team };
    this.formError = '';
    this.modalTeam = team;
    this.modalMode = 'gestion';
    this.modalMembers = this.membersCache[team.teamId!] || [];
  }

  saveEdit(): void {
    if (!this.editForm.name?.trim()) { this.formError = 'Le nom est requis.'; return; }
    this.sending = 'edit';
    this.teamSvc.updateTeam(this.editForm.teamId!, this.editForm).subscribe({
      next: () => {
        this.sending = '';
        this.showToast('Équipe mise à jour !', 'success');
        this.loadAll();
        this.modalMode = null;
      },
      error: () => { this.sending = ''; this.formError = 'Erreur lors de la mise à jour.'; }
    });
  }

  deleteTeam(team: Team): void {
    if (!confirm(`Supprimer définitivement l'équipe « ${team.name} » ?`)) return;
    this.teamSvc.deleteTeam(team.teamId!).subscribe({
      next: () => {
        this.showToast(`Équipe « ${team.name} » supprimée.`, 'success');
        this.loadAll();
        this.modalMode = null;
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // ACTIONS MEMBRE
  // ─────────────────────────────────────────────────────────

  openDetail(team: Team): void {
    this.modalTeam    = team;
    this.modalMode    = 'detail';
    this.modalLoading = true;
    this.memberSvc.getMembers(team.teamId!).subscribe({
      next:  (m: any) => { this.modalMembers = m; this.membersCache[team.teamId!] = m; this.modalLoading = false; },
      error: ()       => { this.modalLoading = false; }
    });
  }

  quitterEquipe(team: Team): void {
    if (!confirm(`Quitter l'équipe « ${team.name} » ?`)) return;
    this.memberSvc.removeMember(team.teamId!, this.currentUserId).subscribe({
      next: () => {
        this.showToast(`Vous avez quitté « ${team.name} ».`, 'success');
        this.loadAll();
        this.modalMode = null;
      },
      error: (err: any) => this.showToast(err?.error?.message || 'Erreur.', 'error')
    });
  }

  demanderRejoindre(team: Team): void {
    this.sending = team.teamId!;
    this.demandeSvc.rejoindre(team.teamId!, this.currentUserId).subscribe({
      next: () => {
        this.sending = '';
        this.showToast(`Demande envoyée pour « ${team.name} » !`, 'success');
      },
      error: (err: any) => {
        this.sending = '';
        this.showToast(err?.error?.message || 'Erreur lors de l\'envoi.', 'error');
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // GESTION DES MEMBRES (CAPITAINE)
  // ─────────────────────────────────────────────────────────

  addMemberToTeam(): void {
    if (!this.newMemberUserId.trim() || !this.modalTeam) return;
    this.sending = 'addmember';
    this.memberSvc.addMember(this.modalTeam.teamId!, this.newMemberUserId.trim(), this.newMemberRole).subscribe({
      next: () => {
        this.sending = '';
        this.newMemberUserId = '';
        this.showToast('Membre ajouté !', 'success');
        this.memberSvc.getMembers(this.modalTeam!.teamId!).subscribe((m: any) => {
          this.modalMembers = m;
          this.membersCache[this.modalTeam!.teamId!] = m;
        });
      },
      error: (err: any) => {
        this.sending = '';
        this.showToast(err?.error?.message || 'Erreur lors de l\'ajout.', 'error');
      }
    });
  }

  removeMemberFromTeam(member: TeamMember): void {
    if (member.roleEquipe === 'CAPTAIN') {
      this.showToast('Impossible de retirer le capitaine.', 'error'); return;
    }
    if (!confirm(`Retirer ce membre de l'équipe ?`)) return;
    this.memberSvc.removeMember(this.modalTeam!.teamId!, member.userId).subscribe({
      next: () => {
        this.modalMembers = this.modalMembers.filter(m => m.userId !== member.userId);
        this.membersCache[this.modalTeam!.teamId!] = this.modalMembers;
        this.showToast('Membre retiré.', 'success');
      },
      error: (err: any) => this.showToast(err?.error?.message || 'Erreur.', 'error')
    });
  }

  closeModal(): void {
    this.modalMode = null;
    this.modalTeam = null;
    this.formError = '';
    this.newMemberUserId = '';
  }

  // ─────────────────────────────────────────────────────────
  // HELPERS AFFICHAGE
  // ─────────────────────────────────────────────────────────

  showToast(msg: string, type: 'success' | 'error'): void {
    this.toast = msg; this.toastType = type;
    setTimeout(() => this.toast = '', 4000);
  }

  sportIcon(sport: string): string {
    const icons: Record<string, string> = {
      'Football': '⚽', 'Basketball': '🏀', 'Padel': '🏓',
      'Tennis': '🎾', 'Volleyball': '🏐', 'Rugby': '🏉', 'Handball': '🤾'
    };
    return icons[sport] || '🏆';
  }

  roleLabel(role: RoleEquipe): string {
    const l: Record<string, string> = { CAPTAIN: 'Capitaine', PLAYER: 'Joueur', COACH: 'Coach', STAFF: 'Staff' };
    return l[role] || role;
  }

  roleColor(role: RoleEquipe): string {
    const c: Record<string, string> = { CAPTAIN: '#F47920', PLAYER: '#0AADE3', COACH: '#16A34A', STAFF: '#9A8F7F' };
    return c[role] || '#9A8F7F';
  }

  teamInitial(name: string): string { return (name || '??').substring(0, 2).toUpperCase(); }

  get displayedTeams(): Team[] {
    return this.activeTab === 'mes-equipes' ? this.myTeams : this.otherTeams;
  }
}
