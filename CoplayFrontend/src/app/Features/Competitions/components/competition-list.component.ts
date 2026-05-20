import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { CompetitionService } from '../services/competition.service';
import { AuthService } from '../../../Core/Services/Auth/auth.service';

@Component({
  selector: 'app-competition-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './competition-list.component.html',
  styleUrls: ['./competition-list.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CompetitionListComponent implements OnInit {

  competitions: any[] = [];
  filteredCompetitions: any[] = [];
  loading = true;

  selectedType: 'ALL' | 'LEAGUE' | 'TOURNAMENT' = 'ALL';

  showCompetitionModal = false;
  deletingCompetitionId: number | null = null;


  get userRole(): string { return this.authService.getUserRole() || ''; }
  get userId(): string    { return this.authService.getUserId(); }
  get isAdmin(): boolean  { return this.authService.isAdmin(); }

  // Toast
  toasts: { message: string, type: 'success' | 'error' | 'info', id: number }[] = [];
  private _toastId = 0;

  newCompetition: any = {
    name: '',
    sport: 'Football',
    type: 'LEAGUE',
    maxTeams: 8,
    startDate: '',
    endDate: '',
    isDoubleLeg: true
  };

  constructor(
    private competitionService: CompetitionService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadCompetitions();
  }

  // LOAD
  loadCompetitions() {
    this.loading = true;

    this.competitionService.getAllCompetitions().subscribe({
      next: (data) => {
        this.competitions = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // FILTER
  filterByType(type: any) {
    this.selectedType = type;
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedType === 'ALL') {
      this.filteredCompetitions = this.competitions;
    } else {
      this.filteredCompetitions =
        this.competitions.filter(c => c.type === this.selectedType);
    }
  }

  // MODAL
  openCompetitionModal() {
    this.showCompetitionModal = true;
  }

  closeCompetitionModal() {
    this.showCompetitionModal = false;
  }

  // CREATE
  submitCompetition() {
    this.competitionService.createCompetition(this.newCompetition)
      .subscribe(() => {
        this.loadCompetitions();
        this.closeCompetitionModal();
      });
  }

  // ─── Toast ───
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const id = ++this._toastId;
    this.toasts.push({ message, type, id });
    setTimeout(() => this.toasts = this.toasts.filter(t => t.id !== id), 4000);
  }

  // JOIN
  joinCompetition(id: string) {
    this.competitionService.joinCompetition(id).subscribe({
      next: (res: any) => {
        this.showToast(res.message || 'Inscription réussie !', 'success');
        this.loadCompetitions();
      },
      error: (err: any) => {
        const msg = err?.error?.message || err?.error || 'Erreur lors de l\'inscription.';
        this.showToast(msg, 'error');
      }
    });
  }

  // DELETE
  deleteCompetition(id: string) {
    const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer cette compétition ? Cette action est irréversible.');
    
    if (!confirmation) return;

    this.deletingCompetitionId = Number(id);

    this.competitionService.deleteCompetition(id).subscribe({
      next: (res: any) => {
        this.deletingCompetitionId = null;
        this.showToast(res.message || 'Compétition supprimée.', 'success');
        this.loadCompetitions();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.deletingCompetitionId = null;
        const msg = err?.error?.message || err?.error || 'Erreur lors de la suppression.';
        this.showToast(msg, 'error');
      }
    });
  }

  // NAV
  goToDetail(id: string) {
    this.router.navigate(['/competitions', id]);
  }

  // PERMISSIONS
  canDelete(comp: any): boolean {
    const uid = this.userId;
    return this.isAdmin || (!!uid && (comp.creator === uid || comp.creatorId === uid));
  }

  canEdit(comp: any): boolean {
    return this.canDelete(comp);
  }

  canCreate(): boolean {
    // Any authenticated user with CAPTAIN, COACH or ADMIN role can create a competition
    const role = this.userRole.toUpperCase();
    return this.isAdmin || role === 'CAPTAIN' || role === 'COACH';
  }

  canJoin(comp: any): boolean {
    const now = new Date();
    const role = this.userRole.toUpperCase();
    const uid  = this.userId;

    if (uid && (comp.creator === uid || comp.creatorId === uid)) return false;
    const hasRightRole  = role === 'COACH' || role === 'CAPTAIN';
    const hasSpace      = (comp.countTeams ?? 0) < (comp.maxTeams ?? 0);
    const isNotFinished = comp.endDate ? new Date(comp.endDate) > now : true;

    return hasRightRole && hasSpace && isNotFinished;
  }

  getJoinBlockReason(comp: any): string {
    const now  = new Date();
    const role = this.userRole.toUpperCase();
    const uid  = this.userId;

    if (uid && (comp.creator === uid || comp.creatorId === uid)) return '👑 Votre compétition';
    if ((comp.countTeams ?? 0) >= (comp.maxTeams ?? 0))          return '🔒 Complet';
    if (comp.endDate && new Date(comp.endDate) <= now)            return '🏁 Terminée';
    if (role !== 'COACH' && role !== 'CAPTAIN')                   return '⚠️ Rôle CAPTAIN requis';
    return '';
  }
}