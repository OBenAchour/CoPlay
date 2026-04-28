import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from 'src/app/services/Team/team.service';
import { TeamMemberService } from 'src/app/services/TeamMember/team-member.service';
import { InvitationService } from 'src/app/services/Invitation/invitation.service';
import { EquipeSponsorService } from 'src/app/services/EquipeSponsor/equipe-sponsor.service';
import { HistoriqueActionService } from 'src/app/services/HistoriqueAction/historique-action.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { UserService } from 'src/app/Core/Services/User/user.service';
import { Team } from 'src/app/Core/Models/Teams/Team';
import { TeamMember } from 'src/app/Core/Models/Teams/TeamMember';
import { EquipeSponsor } from 'src/app/Core/Models/Teams/EquipeSponsor';
import { HistoriqueAction } from 'src/app/Core/Models/Teams/HistoriqueAction';
import { RoleEquipe } from 'src/app/Core/Models/Teams/RoleEquipe';
import { User } from 'src/app/Core/Models/Auth/User';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css']
})
export class TeamDetailComponent implements OnInit {

  // Données équipe
  team: Team | null = null;
  teamId: string = '';
  currentUserId: string = '';
  isCaptain = false;

  // Onglet actif
  activeTab: 'membres' | 'sponsors' | 'historique' = 'membres';

  // Membres
  members: TeamMember[] = [];
  userNames: Map<string, string> = new Map();
  searchQuery = '';
  searchResults: User[] = [];
  selectedUser: User | null = null;
  selectedRole: RoleEquipe = 'PLAYER';
  searchLoading = false;
  searchDone = false;

  // IA
  aiAnalyse = '';
  aiLoading = false;
  showAnalyse = false;

  // Sponsors
  sponsors: EquipeSponsor[] = [];
  newSponsorName = '';
  newLogoUrl = '';
  newSponsorLink = '';
  logoPreview = '';
  showSponsorForm = false;
  confirmDeleteSponsorId: string | null = null;

  // Historique
  actions: HistoriqueAction[] = [];
  searchAction = '';
  newAction = '';

  actionSuggestions = [
    'Entraînement planifié',
    'Match organisé',
    'Réunion d\'équipe',
    'Objectif défini',
    'Victoire enregistrée',
    'Défaite enregistrée',
  ];

  // UI
  loading = false;
  successMsg = '';
  errorMsg = '';

  roles: RoleEquipe[] = ['PLAYER', 'STAFF'];

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private memberService: TeamMemberService,
    private invitationService: InvitationService,
    private sponsorService: EquipeSponsorService,
    private historiqueService: HistoriqueActionService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.teamId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTeam();
    this.loadMembers();
    this.loadSponsors();
    this.loadHistorique();
  }

  loadTeam() {
    this.teamService.getTeamById(this.teamId).subscribe({
      next: (data) => {
        this.team = data;
        this.isCaptain = data.creatorId === this.currentUserId;
        this.updateAvailableRoles();
      },
      error: () => this.showError('Erreur chargement équipe')
    });
  }

  loadMembers() {
    this.memberService.getMembers(this.teamId).subscribe({
      next: (data) => {
        this.members = data;
        this.updateAvailableRoles();
        data.forEach(m => {
          if (!this.userNames.has(m.userId)) {
            this.userService.getUserById(m.userId).subscribe({
              next: (user) => {
                this.userNames.set(m.userId, user.profile?.displayName || user.email || m.userId);
              },
              error: () => {
                this.userNames.set(m.userId, m.userId);
              }
            });
          }
        });
      },
      error: () => {}
    });
  }

  updateAvailableRoles() {
    const hasCoach = this.members.some(m => m.roleEquipe === 'COACH' && m.active);
    this.roles = hasCoach ? ['PLAYER', 'STAFF'] : ['PLAYER', 'COACH', 'STAFF'];
    if (this.roles.length > 0) this.selectedRole = this.roles[0];
  }

  loadSponsors() {
    this.sponsorService.getSponsors(this.teamId).subscribe({
      next: (data) => this.sponsors = data,
      error: () => {}
    });
  }

  loadHistorique() {
    this.historiqueService.getActions(this.teamId).subscribe({
      next: (data) => {
        this.actions = data.sort((a, b) =>
          new Date(b.performedAt || '').getTime() - new Date(a.performedAt || '').getTime()
        );
      },
      error: () => {}
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MEMBRES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  searchUsers() {
    if (!this.searchQuery.trim() || this.searchQuery.length < 2) return;
    this.searchLoading = true;
    this.searchDone = false;
    this.selectedUser = null;
    this.userService.searchUsers(this.searchQuery).subscribe({
      next: (users) => {
        const existingIds = this.members.map(m => m.userId);
        this.searchResults = users.filter(u => !existingIds.includes(u.userId));
        this.searchLoading = false;
        this.searchDone = true;
      },
      error: () => { this.showError('Erreur recherche'); this.searchLoading = false; }
    });
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.searchQuery = user.profile?.displayName || user.email;
    this.searchResults = [];
  }

  clearSelection() {
    this.selectedUser = null;
    this.searchQuery = '';
    this.searchResults = [];
    this.searchDone = false;
    this.aiAnalyse = '';
    this.showAnalyse = false;
  }

  sendInvitation() {
    if (!this.selectedUser) return;
    this.loading = true;
    this.invitationService.inviterUser(
      this.teamId,
      this.selectedUser.userId,
      this.currentUserId,
      this.selectedRole
    ).subscribe({
      next: () => {
        this.clearSelection();
        this.showSuccess(`Invitation envoyée comme ${this.getRoleLabel(this.selectedRole)} !`);
        this.loading = false;
      },
      error: () => { this.showError('Erreur envoi invitation'); this.loading = false; }
    });
  }

  removeMember(userId: string) {
    this.memberService.removeMember(this.teamId, userId, this.currentUserId).subscribe({
      next: () => {
        this.members = this.members.filter(m => m.userId !== userId);
        this.updateAvailableRoles();
        this.showSuccess('Membre retiré !');
      },
      error: () => this.showError('Erreur suppression')
    });
  }


  // IA Analyse
  async analyserEquipe() {
    if (this.members.length === 0) return;
    this.aiLoading = true;
    this.showAnalyse = true;
    this.aiAnalyse = '';
    const countByRole = {
      CAPTAIN: this.members.filter(m => m.roleEquipe === 'CAPTAIN').length,
      PLAYER: this.members.filter(m => m.roleEquipe === 'PLAYER').length,
      COACH: this.members.filter(m => m.roleEquipe === 'COACH').length,
      STAFF: this.members.filter(m => m.roleEquipe === 'STAFF').length,
    };
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: `Tu es un expert en gestion d'équipes sportives. Analyse cette composition et donne un rapport concis en français :
Équipe : ${this.team?.name}
Sport : ${this.team?.sport}
Total membres : ${this.members.length}
Capitaines : ${countByRole.CAPTAIN}
Joueurs : ${countByRole.PLAYER}
Coachs : ${countByRole.COACH}
Staff : ${countByRole.STAFF}
Capacité max : ${this.team?.capacityMax}

Donne : 1) Score /10  2) Points forts  3) Points faibles  4) Recommandation. Sois concis.`
          }]
        })
      });
      const data = await response.json();
      this.aiAnalyse = data.content[0].text;
    } catch (e) {
      this.aiAnalyse = 'Erreur analyse IA.';
    } finally {
      this.aiLoading = false;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SPONSORS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  onLogoUrlChange() { this.logoPreview = this.newLogoUrl.trim(); }

  addSponsor() {
    if (!this.newSponsorName.trim()) return;
    this.loading = true;
    this.sponsorService.addSponsor(
      this.teamId,
      this.currentUserId,
      this.newSponsorName.trim(),
      this.newLogoUrl.trim(),
      this.newSponsorLink.trim()
    ).subscribe({
      next: (s) => {
        this.sponsors.push(s);
        this.newSponsorName = '';
        this.newLogoUrl = '';
        this.logoPreview = '';
        this.showSponsorForm = false;
        this.showSuccess('Sponsor ajouté !');
        this.loading = false;
      },
      error: () => { this.showError('Erreur ajout sponsor'); this.loading = false; }
    });
  }

  confirmDeleteSponsor(id: string) { this.confirmDeleteSponsorId = id; }
  cancelDeleteSponsor() { this.confirmDeleteSponsorId = null; }

  removeSponsor(id: string) {
    this.sponsorService.removeSponsor(id, this.currentUserId, this.teamId).subscribe({
      next: () => {
        this.sponsors = this.sponsors.filter(s => s.id !== id);
        this.confirmDeleteSponsorId = null;
        this.showSuccess('Sponsor retiré !');
      },
      error: () => this.showError('Erreur suppression sponsor')
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HISTORIQUE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  useSuggestion(s: string) { this.newAction = s; }

  addAction() {
    if (!this.newAction.trim()) return;
    this.loading = true;
    const action: HistoriqueAction = {
      teamId: this.teamId,
      actorId: this.currentUserId,
      action: this.newAction.trim()
    };
    this.historiqueService.addAction(this.teamId, action).subscribe({
      next: (saved) => {
        this.actions.unshift(saved);
        this.newAction = '';
        this.showSuccess('Action enregistrée !');
        this.loading = false;
      },
      error: (err) => { 
        console.error('Erreur ajout action:', err);
        this.showError('Erreur enregistrement: ' + (err.error?.message || err.statusText || 'inconnue')); 
        this.loading = false; 
      }
    });
  }

  clearHistorique() {
    if (!confirm('Voulez-vous vraiment vider tout l\'historique ?')) return;
    this.loading = true;
    this.historiqueService.clearActions(this.teamId, this.currentUserId).subscribe({
      next: () => {
        this.actions = [];
        this.showSuccess('Historique vidé !');
        this.loading = false;
      },
      error: () => { this.showError('Erreur lors de la suppression'); this.loading = false; }
    });
  }

  get actionsFiltrees(): HistoriqueAction[] {
    if (!this.searchAction.trim()) return this.actions;
    return this.actions.filter(a =>
      a.action.toLowerCase().includes(this.searchAction.toLowerCase())
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  get countByRole() {
    return {
      CAPTAIN: this.members.filter(m => m.roleEquipe === 'CAPTAIN').length,
      PLAYER: this.members.filter(m => m.roleEquipe === 'PLAYER').length,
      COACH: this.members.filter(m => m.roleEquipe === 'COACH').length,
      STAFF: this.members.filter(m => m.roleEquipe === 'STAFF').length,
    };
  }

  getRoleLabel(role: RoleEquipe): string {
    return { CAPTAIN: 'Capitaine', PLAYER: 'Joueur', COACH: 'Coach', STAFF: 'Staff' }[role];
  }

  getRoleClass(role: RoleEquipe): string {
    return { CAPTAIN: 'badge-captain', PLAYER: 'badge-player', COACH: 'badge-coach', STAFF: 'badge-staff' }[role];
  }

  getInitiales(id: string): string {
    const name = this.userNames.get(id);
    return name ? name.substring(0, 2).toUpperCase() : (id ? id.substring(0, 2).toUpperCase() : '??');
  }

  getUserName(userId: string): string {
    return this.userNames.get(userId) || userId;
  }

  getActionIcon(action: string): string {
    if (action.toLowerCase().includes('creat') || action.toLowerCase().includes('ajout') || action.toLowerCase().includes('invit')) return '+';
    if (action.toLowerCase().includes('retir') || action.toLowerCase().includes('supprim') || action.toLowerCase().includes('reject')) return '-';
    if (action.toLowerCase().includes('coach')) return 'C';
    if (action.toLowerCase().includes('match') || action.toLowerCase().includes('victoire')) return 'M';
    if (action.toLowerCase().includes('accept')) return 'A';
    if (action.toLowerCase().includes('annul')) return 'X';
    return '•';
  }

  getIconClass(action: string): string {
    if (action.toLowerCase().includes('accept') || action.toLowerCase().includes('victoire') || action.toLowerCase().includes('ajout')) return 'icon-green';
    if (action.toLowerCase().includes('retir') || action.toLowerCase().includes('annul') || action.toLowerCase().includes('reject')) return 'icon-red';
    if (action.toLowerCase().includes('coach')) return 'icon-blue';
    if (action.toLowerCase().includes('match') || action.toLowerCase().includes('planif')) return 'icon-purple';
    if (action.toLowerCase().includes('invit')) return 'icon-orange';
    return 'icon-gray';
  }

  getGradient(name: string): string {
    const gradients = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #fda085, #f6d365)',
    ];
    return gradients[name.charCodeAt(0) % gradients.length];
  }

  getSponsorInitiales(name: string): string {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }

  private showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 3000);
  }

    protected readonly onclick = onclick;
}
