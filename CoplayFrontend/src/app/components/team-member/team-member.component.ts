import { Component, OnInit } from '@angular/core';
import { TeamMemberService } from 'src/app/services/TeamMember/team-member.service';
import { TeamService } from 'src/app/services/Team/team.service';
import { AuthService } from 'src/app/Core/Services/Auth/auth.service';
import { UserService } from 'src/app/Core/Services/User/user.service';
import { InvitationService } from 'src/app/services/Invitation/invitation.service';
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
  allTeams: Team[] = [];
  myTeams: Team[] = [];
  members: TeamMember[] = [];
  selectedTeamId: string = '';
  selectedTeamName: string = '';
  userNames: Map<string, string> = new Map();


  // Recherche utilisateur
  searchQuery: string = '';
  searchResults: User[] = [];
  selectedUser: User | null = null;
  selectedRole: RoleEquipe = 'PLAYER';
  searchLoading = false;
  searchDone = false;

  
  activeTab: RoleEquipe | 'TOUS' = 'TOUS';
  loading = false;
  isCaptain = false;
  successMsg = '';
  errorMsg = '';


  roles: RoleEquipe[] = ['PLAYER', 'COACH', 'STAFF'];

  currentUserId = '';

  




  constructor(
    private memberService: TeamMemberService,
    private teamService: TeamService,
    private authService: AuthService,
    private userService: UserService,
    private invitationService: InvitationService
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
      },
      error: () => this.showError('Erreur chargement équipes')
    });
  }

  loadMembers() {
    if (!this.selectedTeamId) return;
    this.loading = true;
    this.memberService.getMembers(this.selectedTeamId).subscribe({
      next: (data) => {
        this.members = data;
        this.loading = false;
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
    const team = this.allTeams.find(t => t.teamId === this.selectedTeamId);
    this.selectedTeamName = team?.name || '';
    this.members = [];
    this.activeTab = 'TOUS';
    this.selectedUser = null;
    this.searchResults = [];
    this.searchQuery = '';
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
  }

  sendInvitation() {
    if (!this.selectedUser || !this.selectedTeamId) return;
    this.loading = true;
    this.invitationService.inviterUser(
      this.selectedTeamId,
      this.selectedUser.userId,
      this.currentUserId,
      this.selectedRole
    ).subscribe({
      next: () => {
        this.clearSelection();
        this.showSuccess('Invitation envoyée !');
        this.loading = false;
      },
      error: () => { this.showError('Erreur envoi invitation'); this.loading = false; }
    });
  }

  removeMember(userId: string) {
    this.memberService.removeMember(this.selectedTeamId, userId, this.currentUserId).subscribe({
      next: () => {
        this.members = this.members.filter(m => m.userId !== userId);
        this.showSuccess('Membre retiré !');
      },
      error: () => this.showError('Erreur suppression')
    });
  }

  
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
    const name = this.userNames.get(userId);
    return name ? name.substring(0, 2).toUpperCase() : (userId ? userId.substring(0, 2).toUpperCase() : '??');
  }

  getUserName(userId: string): string {
    return this.userNames.get(userId) || userId;
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




}
