import { Component, OnInit } from '@angular/core';
import { TeamMemberService } from 'src/app/services/TeamMember/team-member.service';
import { TeamService } from 'src/app/services/Team/team.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { UserService } from 'src/app/Core/Services/User/user.service';
import { TeamMember } from 'src/app/Core/Models/Teams/TeamMember';
import { RoleEquipe } from 'src/app/Core/Models/Teams/RoleEquipe';
import { Team } from 'src/app/Core/Models/Teams/Team';
import { User } from '../../Core/Models/Auth/User';

@Component({
  selector: 'app-team-member',
  templateUrl: './team-member.component.html',
  styleUrls: ['./team-member.component.css']
})
export class TeamMemberComponent implements OnInit {

  // Données
  myTeams: Team[] = [];
  members: TeamMember[] = [];
  selectedTeamId: string = '';
  selectedTeamName: string = '';


  // Recherche utilisateur
  searchQuery: string = '';
  searchResults: User[] = [];
  selectedUser: User | null = null;
  selectedRole: RoleEquipe = 'PLAYER';
  searchLoading = false;
  searchDone = false;

  // Rôle IA
  playerDescription: string = '';
  aiLoading = false;
  aiResult: { role: RoleEquipe; reason: string } | null = null;
  showAiPanel = false;

  // UI
  activeTab: RoleEquipe | 'TOUS' = 'TOUS';
  loading = false;
  isCaptain = false;
  successMsg = '';
  errorMsg = '';


  roles: RoleEquipe[] = ['CAPTAIN', 'PLAYER', 'COACH', 'STAFF'];

  currentUserId = '';

  // IA — Analyse compatibilité
  aiAnalyse: string = '';
  aiAnalyseLoading = false;
  showAnalyse = false;




  constructor(
    private memberService: TeamMemberService,
    private teamService: TeamService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadAllTeams(); // ← toutes les équipes, pas juste les miennes
  }

  loadAllTeams() {
    this.loading = true;
    this.teamService.getAllTeams().subscribe({
      next: (data) => {
        this.myTeams = data; // on réutilise myTeams comme liste
        if (data.length > 0) {
          this.selectedTeamId = data[0].teamId!;
          this.selectedTeamName = data[0].name;
          this.loadMembers();
          this.checkCaptain();
        }
        this.loading = false;
      },
      error: () => {
        this.showError('Erreur chargement équipes');
        this.loading = false;
      }
    });
  }

  loadMyTeams() {
    this.teamService.getMyTeams(this.currentUserId).subscribe({
      next: (data) => {
        this.myTeams = data;
        if (data.length > 0) {
          this.selectedTeamId = data[0].teamId!;
          this.selectedTeamName = data[0].name;
          this.loadMembers();
          this.checkCaptain();
        }
      },
      error: () => this.showError('Erreur chargement équipes')
    });
  }

  loadMembers() {
    if (!this.selectedTeamId) return;
    this.loading = true;
    this.memberService.getMembers(this.selectedTeamId).subscribe({
      next: (data) => { this.members = data; this.loading = false; },
      error: () => { this.showError('Erreur chargement membres'); this.loading = false; }
    });
  }

  checkCaptain() {
    if (!this.selectedTeamId || !this.currentUserId) return;
    this.memberService.isCaptain(this.selectedTeamId, this.currentUserId).subscribe({
      next: (result) => this.isCaptain = result,
      error: () => this.isCaptain = false
    });
  }

  onTeamChange() {
    const team = this.myTeams.find(t => t.teamId === this.selectedTeamId);
    this.selectedTeamName = team?.name || '';
    this.members = [];
    this.activeTab = 'TOUS';
    this.selectedUser = null;
    this.searchResults = [];
    this.searchQuery = '';
    this.aiResult = null;
    this.loadMembers();
    this.checkCaptain();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Recherche utilisateur
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  searchUsers() {
    if (!this.searchQuery.trim() || this.searchQuery.length < 2) return;
    this.searchLoading = true;
    this.searchDone = false;
    this.selectedUser = null;
    this.userService.searchUsers(this.searchQuery).subscribe({
      next: (users) => {
        const existingIds = this.members.map(m => m.userId);
        this.searchResults = users.filter(u => !existingIds.includes(u.userId)); // ← userId
        this.searchLoading = false;
        this.searchDone = true;
      },
      error: () => {
        this.showError('Erreur recherche');
        this.searchLoading = false;
      }
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
    this.aiResult = null;
    this.playerDescription = '';
    this.showAiPanel = false;
  }

  addMember() {
    if (!this.selectedUser || !this.selectedTeamId) return;
    this.loading = true;
    this.memberService.addMember(
      this.selectedTeamId,
      this.selectedUser.userId, // ← userId pas id
      this.selectedRole
    ).subscribe({
      next: (member) => {
        this.members.unshift(member);
        this.clearSelection();
        this.showSuccess('Membre ajouté !');
        this.loading = false;
      },
      error: () => { this.showError('Erreur ajout membre'); this.loading = false; }
    });
  }

  removeMember(userId: string) {
    this.memberService.removeMember(this.selectedTeamId, userId).subscribe({
      next: () => {
        this.members = this.members.filter(m => m.userId !== userId);
        this.showSuccess('Membre retiré !');
      },
      error: () => this.showError('Erreur suppression')
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IA — Recommandation rôle
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  async analyzeWithAI() {
    if (!this.playerDescription.trim()) return;
    this.aiLoading = true;
    this.aiResult = null;
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: `Tu es un assistant sportif. Analyse ce profil de joueur et recommande UN seul rôle parmi : CAPTAIN, PLAYER, COACH, STAFF.
Profil : "${this.playerDescription}"
Réponds UNIQUEMENT en JSON valide sans texte avant ou après :
{"role": "PLAYER", "reason": "Explication courte en français de max 20 mots"}`
          }]
        })
      });
      const data = await response.json();
      const text = data.content[0].text.trim();
      const parsed = JSON.parse(text);
      if (['CAPTAIN','PLAYER','COACH','STAFF'].includes(parsed.role)) {
        this.aiResult = parsed;
        this.selectedRole = parsed.role;
      } else {
        this.showError('Réponse IA invalide');
      }
    } catch (e) {
      this.showError('Erreur analyse IA');
    } finally {
      this.aiLoading = false;
    }
  }

  applyAiRole() {
    if (this.aiResult) {
      this.selectedRole = this.aiResult.role;
      this.showAiPanel = false;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Helpers
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  get membresFiltres(): TeamMember[] {
    if (this.activeTab === 'TOUS') return this.members;
    return this.members.filter(m => m.roleEquipe === this.activeTab);
  }

  get countByRole() {
    return {
      CAPTAIN: this.members.filter(m => m.roleEquipe === 'CAPTAIN').length,
      PLAYER:  this.members.filter(m => m.roleEquipe === 'PLAYER').length,
      COACH:   this.members.filter(m => m.roleEquipe === 'COACH').length,
      STAFF:   this.members.filter(m => m.roleEquipe === 'STAFF').length,
    };
  }

  setTab(tab: RoleEquipe | 'TOUS') { this.activeTab = tab; }

  getInitiales(userId: string): string {
    return userId ? userId.substring(0, 2).toUpperCase() : '??';
  }

  getUserName(userId: string): string {
    return userId;
  }

  getRoleLabel(role: RoleEquipe): string {
    return { CAPTAIN:'Capitaine', PLAYER:'Joueur', COACH:'Coach', STAFF:'Staff' }[role];
  }

  getRoleClass(role: RoleEquipe): string {
    return { CAPTAIN:'badge-captain', PLAYER:'badge-player', COACH:'badge-coach', STAFF:'badge-staff' }[role];
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }

  private showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 3000);
  }

  async analyserEquipe() {
    if (this.members.length === 0) {
      this.showError('Aucun membre à analyser');
      return;
    }

    this.aiAnalyseLoading = true;
    this.showAnalyse = true;
    this.aiAnalyse = '';

    const composition = {
      equipe: this.selectedTeamName,
      totalMembres: this.members.length,
      capitaines: this.members.filter(m => m.roleEquipe === 'CAPTAIN').length,
      joueurs: this.members.filter(m => m.roleEquipe === 'PLAYER').length,
      coachs: this.members.filter(m => m.roleEquipe === 'COACH').length,
      staff: this.members.filter(m => m.roleEquipe === 'STAFF').length
    };

    // ✅ FAKE IA (SANS API → PAS DE CORS)
    setTimeout(() => {
      this.aiAnalyse = `
Score de compatibilité: ${composition.coachs > 0 ? 8 : 5}/10

Points forts:
- Équipe avec ${composition.joueurs} joueurs actifs
- Structure globale cohérente

Points faibles:
- Coachs: ${composition.coachs}
- Staff: ${composition.staff}

Recommandation:
${composition.coachs === 0
        ? '⚠ Ajouter un coach pour améliorer la performance'
        : '✔ Équipe bien équilibrée, continuez ainsi'}
    `.trim();

      this.aiAnalyseLoading = false;
    }, 800);
  }




}
