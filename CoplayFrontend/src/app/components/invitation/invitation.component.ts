import { Component, OnInit } from '@angular/core';
import { InvitationService, Invitation } from '../../services/Invitation/invitation.service';
import { AuthService } from '../../Core/Services/Auth/auth.service';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.css']
})
export class InvitationComponent implements OnInit {

  receivedInvitations: Invitation[] = [];
  loading = false;
  processing = '';
  toast = '';
  toastType: 'success' | 'error' = 'success';

  get currentUserId(): string {
    return this.auth.getUserId();
  }

  constructor(
    private invitationSvc: InvitationService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReceivedInvitations();
  }

  loadReceivedInvitations(): void {
    this.loading = true;
    this.invitationSvc.getReceivedInvitations().subscribe({
      next: (invitations: Invitation[]) => {
        this.receivedInvitations = invitations;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.showToast('Erreur lors du chargement des invitations', 'error');
      }
    });
  }

  acceptInvitation(invitation: Invitation): void {
    if (!confirm(`Accepter l'invitation pour rejoindre ${invitation.teamName} ?`)) return;

    this.processing = invitation.invitationId;
    this.invitationSvc.acceptInvitation(invitation.invitationId).subscribe({
      next: () => {
        this.processing = '';
        this.receivedInvitations = this.receivedInvitations.filter(
          inv => inv.invitationId !== invitation.invitationId
        );
        this.showToast(`Invitation acceptée ! Vous avez rejoint ${invitation.teamName}`, 'success');
      },
      error: (err: any) => {
        this.processing = '';
        this.showToast(err?.error?.message || 'Erreur lors de l\'acceptation', 'error');
      }
    });
  }
  clearAllInvitations(): void {
    if (!confirm('Êtes-vous sûr de vouloir vider la liste ?')) return;
    this.receivedInvitations = [];
    this.showToast('Liste vidée', 'success');
  }

  refuseInvitation(invitation: Invitation): void {
    if (!confirm(`Refuser l'invitation pour ${invitation.teamName} ?`)) return;

    this.processing = invitation.invitationId;
    this.invitationSvc.rejectInvitation(invitation.invitationId).subscribe({
      next: () => {
        this.processing = '';
        this.receivedInvitations = this.receivedInvitations.filter(
          inv => inv.invitationId !== invitation.invitationId
        );
        this.showToast('Invitation refusée', 'success');
      },
      error: (err: any) => {
        this.processing = '';
        this.showToast(err?.error?.message || 'Erreur lors du refus', 'error');
      }
    });
  }

  teamInitial(teamName: string | undefined): string {
    return (teamName || '??').substring(0, 2).toUpperCase();
  }

  sportIcon(sport: string | undefined): string {
    const icons: Record<string, string> = {
      'Football': '⚽',
      'Basketball': '🏀',
      'Padel': '🏓',
      'Tennis': '🎾',
      'Volleyball': '🏐',
      'Rugby': '🏉',
      'Handball': '🤾'
    };
    return icons[sport || ''] || '🏆';
  }

  formatDate(d: Date | string | undefined): string {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  showToast(msg: string, type: 'success' | 'error'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 4000);
  }
}
