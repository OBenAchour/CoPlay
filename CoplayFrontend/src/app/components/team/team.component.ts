import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { TeamService } from '../../services/Team/team.service';
import { TeamMemberService } from '../../services/TeamMember/team-member.service';
import { DemandeAdhesionService } from '../../services/DemandeAdhesion/demande-adhesion.service';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { Team } from '../../Core/Models/Teams/Team';
import { TeamMember } from '../../Core/Models/Teams/TeamMember';
import { RoleEquipe } from '../../Core/Models/Teams/RoleEquipe';
import { UserService } from "../../Core/Services/User/user.service";
import { InvitationService } from '../../services/Invitation/invitation.service';

interface MemberDTO {
  memberId: string;
  userId: string;
  displayName: string;
  email: string;
  roleEquipe: RoleEquipe;
  active?: boolean;
  joinedAt?: Date;
  avatarUrl?: string;
}

type ActiveTab = 'mes-equipes' | 'decouvrir';
type ModalMode = 'detail' | 'gestion' | 'create';
type DetailTab = 'infos' | 'assistant';  // ← AJOUTER CETTE LIGNE

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  allTeams: Team[] = [];
  myTeams: Team[] = [];
  otherTeams: Team[] = [];

  myRoles: Record<string, RoleEquipe | null> = {};
  membersCache: Record<string, MemberDTO[]> = {};

  activeTab: ActiveTab = 'mes-equipes';
  loading = false;
  sending = '';
  toast = '';
  toastType: 'success' | 'error' = 'success';

  modalMode: ModalMode | null = null;
  modalTeam: Team | null = null;
  modalMembers: MemberDTO[] = [];
  modalLoading = false;
  detailTab: DetailTab = 'infos';  // ← AJOUTER CETTE LIGNE


  editForm: Team = { name: '', sport: '', city: '', description: '', capacityMax: 11 };
  formError = '';

  demandesModal = false;
  demandeTeam: Team | null = null;
  demandes: any[] = [];

  readonly sports = ['Football', 'Basketball', 'Padel', 'Tennis', 'Volleyball', 'Rugby', 'Handball'];

  get availableRoles(): RoleEquipe[] {
    const roles = ['PLAYER', 'COACH', 'STAFF'] as RoleEquipe[];
    const hasCoach = this.modalMembers.some(m => m.roleEquipe === 'COACH');
    return hasCoach ? roles.filter(r => r !== 'COACH') : roles;
  }

  newMemberUserId = '';
  newMemberRole: RoleEquipe = 'PLAYER';

  searchResults: any[] = [];
  searchQuery = '';
  showSearchResults = false;
  selectedUser: any = null;
  sentInvitations: any[] = [];
  receivedDemandes: any[] = [];  // ← AJOUTER CETTE LIGNE

  get currentUserId(): string { return this.auth.getUserId(); }

  constructor(
    private teamSvc: TeamService,
    private memberSvc: TeamMemberService,
    private demandeSvc: DemandeAdhesionService,
    private invitationSvc: InvitationService,
    private auth: AuthService,
    private userSvc: UserService
  ) {}

  ngOnInit(): void { this.loadAll(); }

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
        this.membersCache[teamId] = members as any;
        const me = members.find((m: TeamMember) => m.userId === this.currentUserId && m.active !== false);
        this.myRoles[teamId] = me ? me.roleEquipe : null;
      });
      this.splitTeams();
      this.loading = false;
    });
  }

  private splitTeams(): void {
    this.myTeams = this.allTeams.filter(t => this.myRoles[t.teamId!] !== null && this.myRoles[t.teamId!] !== undefined);
    this.otherTeams = this.allTeams.filter(t => !this.myRoles[t.teamId!]);
    if (this.myTeams.length === 0) this.activeTab = 'decouvrir';
  }

  isMember(teamId: string): boolean { return !!this.myRoles[teamId]; }
  isCaptain(teamId: string): boolean { return this.myRoles[teamId] === 'CAPTAIN'; }
  canEdit(teamId: string): boolean { return this.isCaptain(teamId); }
  canDelete(teamId: string): boolean { return this.isCaptain(teamId); }
  canJoin(teamId: string): boolean { return !this.isMember(teamId); }

  getMyRoleLabel(teamId: string): string {
    const labels: Record<string, string> = {
      CAPTAIN: '⭐ Capitaine', PLAYER: '👤 Joueur',
      COACH: '📋 Coach', STAFF: '🔧 Staff'
    };
    return labels[this.myRoles[teamId] || ''] || '';
  }

  openCreate(): void {
    this.editForm = { name: '', sport: this.sports[0], city: '', description: '', capacityMax: 11 };
    this.formError = '';
    this.modalMode = 'create';
  }

  // Remplace la méthode createTeam() dans team.component.ts par celle-ci

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

        // ===== FIX: Ajout optimiste (ne pas attendre loadAll) =====
        this.allTeams.push(team);
        this.myRoles[team.teamId] = 'CAPTAIN';
        this.membersCache[team.teamId] = [{
          memberId: '',
          userId: this.currentUserId,
          displayName: 'Vous',
          email: '',
          roleEquipe: 'CAPTAIN' as RoleEquipe,
          active: true
        }];
        this.splitTeams();
        // Recharger proprement après pour rester synchro
        setTimeout(() => this.loadAll(), 1000);
        // =========================================================
      },
      error: (err: any) => {
        this.sending = '';
        this.formError = err?.error?.message || 'Erreur lors de la création.';
      }
    });
  }

  openEdit(team: Team): void {
    this.editForm = { ...team };
    this.formError = '';
    this.modalTeam = team;
    this.modalMode = 'gestion';
    this.modalMembers = this.membersCache[team.teamId!] || [];
    this.newMemberUserId = '';
    this.newMemberRole = 'PLAYER';
    this.searchQuery = '';
    this.selectedUser = null;
    this.searchResults = [];
    this.showSearchResults = false;
    this.receivedDemandes = [];  // ← AJOUTER CETTE LIGNE

    this.invitationSvc.getSentInvitations(team.teamId!).subscribe({
      next: (invitations: any[]) => {
        this.sentInvitations = invitations.map(inv => ({
          invitationId: inv.invitationId,
          userId: inv.invitedUserId,
          statut: inv.statut,
          createdAt: new Date(inv.createdAt)
        }));
      },
      error: () => { this.sentInvitations = []; }
    });
    // Charger les demandes d'adhésion reçues
    this.demandeSvc.getReceivedRequests(team.teamId!).subscribe({
      next: (demandes: any[]) => {
        this.receivedDemandes = demandes
          .filter(d => d.statut === 'PENDING')
          .map(d => ({
            demandeId: d.demandeId,
            userId: d.userId,
            proposedRole: d.proposedRole || 'PLAYER',
            createdAt: new Date(d.createdAt)
          }));
      },
      error: () => { this.receivedDemandes = []; }
    });
  }

  // Accepter une demande d'adhésion
  accepterDemande(demande: any): void {
    if (!confirm(`Accepter la demande de ${demande.userId} ?`)) return;

    this.demandeSvc.accepter(demande.demandeId, this.currentUserId).subscribe({
      next: () => {
        this.showToast(`Demande acceptée ! ${demande.userId} a rejoint l'équipe.`, 'success');
        this.receivedDemandes = this.receivedDemandes.filter(d => d.demandeId !== demande.demandeId);
        this.teamSvc.getTeamDetail(this.modalTeam!.teamId!).subscribe({
          next: (response: any) => {
            this.modalMembers = response.members || [];
            this.membersCache[this.modalTeam!.teamId!] = this.modalMembers;
          }
        });
      },
      error: (err: any) => {
        this.showToast(err?.error?.message || 'Erreur lors de l\'acceptation.', 'error');
      }
    });
  }

// Refuser une demande d'adhésion
  refuserDemande(demande: any): void {
    if (!confirm(`Refuser la demande de ${demande.userId} ?`)) return;

    this.demandeSvc.refuser(demande.demandeId, this.currentUserId).subscribe({
      next: () => {
        this.showToast(`Demande refusée.`, 'success');
        this.receivedDemandes = this.receivedDemandes.filter(d => d.demandeId !== demande.demandeId);
      },
      error: (err: any) => {
        this.showToast(err?.error?.message || 'Erreur lors du refus.', 'error');
      }
    });
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

  openDetail(team: Team): void {
    this.modalTeam = team;
    this.modalMode = 'detail';
    this.modalLoading = true;

    this.teamSvc.getTeamDetail(team.teamId!).subscribe({
      next: (response: any) => {
        this.modalMembers = response.members || [];
        this.membersCache[team.teamId!] = this.modalMembers;
        this.modalLoading = false;
      },
      error: () => {
        this.modalLoading = false;
      }
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

  addMemberToTeam(): void {
    if (!this.newMemberUserId.trim() || !this.modalTeam) return;

    const alreadyInvited = this.sentInvitations.some(
      inv => inv.userId === this.newMemberUserId.trim()
    );

    if (alreadyInvited) {
      this.showToast('Cet utilisateur a déjà une invitation en cours !', 'error');
      return;
    }

    const alreadyMember = this.modalMembers.some(
      m => m.userId === this.newMemberUserId.trim()
    );

    if (alreadyMember) {
      this.showToast('Cet utilisateur est déjà membre de l\'équipe !', 'error');
      return;
    }

    this.sending = 'addmember';

    this.invitationSvc.inviter(
      this.modalTeam.teamId!,
      this.newMemberUserId.trim(),
      this.currentUserId,
      this.newMemberRole
    )
      .subscribe({
        next: () => {
          this.sending = '';
          this.newMemberUserId = '';
          this.searchQuery = '';
          this.selectedUser = null;
          this.searchResults = [];
          this.newMemberRole = 'PLAYER';
          this.showToast('Invitation envoyée !', 'success');

          this.invitationSvc.getSentInvitations(this.modalTeam!.teamId!).subscribe({
            next: (invitations: any[]) => {
              this.sentInvitations = invitations.map(inv => ({
                invitationId: inv.invitationId,
                userId: inv.invitedUserId,
                statut: inv.statut,
                createdAt: new Date(inv.createdAt)
              }));
            },
            error: (err: any) => {
              console.error('Erreur lors du chargement des invitations:', err);
            }
          });
        },
        error: (err: any) => {
          this.sending = '';
          this.showToast(err?.error?.message || 'Erreur lors de l\'envoi.', 'error');
        }
      });
  }

  removeMemberFromTeam(member: MemberDTO): void {
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

  searchUsers(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    this.userSvc.searchUsers(this.searchQuery.trim()).subscribe({
      next: (users: any[]) => {
        this.searchResults = users;
        this.showSearchResults = this.searchResults.length > 0;
      },
      error: () => {
        this.searchResults = [];
        this.showSearchResults = false;
      }
    });
  }

  selectUser(user: any): void {
    this.selectedUser = user;
    this.newMemberUserId = user.userId;
    this.searchQuery = user.profile.displayName;
    this.searchResults = [];
    this.showSearchResults = false;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedUser = null;
    this.newMemberUserId = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  deleteInvitation(invitation: any): void {
    if (!confirm(`Supprimer cette invitation ?`)) return;

    this.invitationSvc.deleteInvitation(invitation.invitationId).subscribe({
      next: () => {
        this.showToast('Invitation supprimée.', 'success');

        setTimeout(() => {
          this.invitationSvc.getSentInvitations(this.modalTeam!.teamId!).subscribe({
            next: (invitations: any[]) => {
              this.sentInvitations = invitations.map(inv => ({
                invitationId: inv.invitationId,
                userId: inv.invitedUserId,
                statut: inv.statut,
                createdAt: new Date(inv.createdAt)
              }));
            }
          });
        }, 500);
      },
      error: (err: any) => {
        this.showToast(err?.error?.message || 'Erreur lors de la suppression.', 'error');
      }
    });
  }

  closeModal(): void {
    this.modalMode = null;
    this.modalTeam = null;
    this.formError = '';
    this.newMemberUserId = '';
    this.newMemberRole = 'PLAYER';
    this.searchQuery = '';
    this.selectedUser = null;
    this.searchResults = [];
    this.showSearchResults = false;
    this.sentInvitations = [];
  }

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

  formatDate(d: Date): string {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
