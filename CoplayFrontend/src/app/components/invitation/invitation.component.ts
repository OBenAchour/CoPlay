import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../services/Team/team.service';
import { InvitationService, Invitation } from '../../services/Invitation/invitation.service';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { Team } from '../../Core/Models/Teams/Team';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.css']
})
export class InvitationComponent implements OnInit {

  teams: Team[]             = [];
  sentInvitations: Array<Invitation & { teamName: string; sentAt: Date }> = [];

  selectedTeamId  = '';
  invitedUserId   = '';
  loading  = false;
  sending  = false;
  toast    = '';
  toastType: 'success' | 'error' = 'success';

  get currentUserId(): string { return this.auth.getUserId(); }

  constructor(
    private teamSvc:       TeamService,
    private invitationSvc: InvitationService,
    private auth:          AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.teamSvc.getAllTeams().subscribe({
      next:  (data: any) => { this.teams = data; this.loading = false; },
      error: ()          => { this.loading = false; }
    });
  }

  get selectedTeam(): Team | undefined {
    return this.teams.find(t => t.teamId === this.selectedTeamId);
  }

  invite(): void {
    if (!this.selectedTeamId || !this.invitedUserId.trim()) return;

    this.sending = true;
    this.invitationSvc.inviter(this.selectedTeamId, this.invitedUserId.trim(), this.currentUserId)
      .subscribe({
        next: (inv) => {
          this.sentInvitations.unshift({
            ...inv,
            teamName: this.selectedTeam?.name || this.selectedTeamId,
            sentAt:   new Date()
          });
          this.invitedUserId  = '';
          this.selectedTeamId = '';
          this.sending = false;
          this.showToast('Invitation envoyée avec succès !', 'success');
        },
        error: (err: any) => {
          this.sending = false;
          const msg = err?.error?.message || 'Erreur lors de l\'envoi de l\'invitation.';
          this.showToast(msg, 'error');
        }
      });
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast     = msg;
    this.toastType = type;
    setTimeout(() => this.toast = '', 4000);
  }

  sportIcon(sport: string): string {
    const icons: Record<string, string> = {
      'Football': '⚽', 'Basketball': '🏀', 'Padel': '🏓',
      'Tennis': '🎾',  'Volleyball': '🏐', 'Rugby': '🏉', 'Handball': '🤾'
    };
    return icons[sport] || '🏆';
  }

  teamInitial(name: string): string {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
