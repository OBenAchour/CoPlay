import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchService } from '../services/match.service';
import { MatchCompetition } from '../../../Core/Models/Competitions/MatchCompetition';
import { MatchStatus } from '../../../Core/Models/Competitions/MatchStatus';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-detail.component.html',
  styleUrls: ['./match-detail.component.css']
})
export class MatchDetailComponent implements OnInit {
  match: MatchCompetition | null = null;
  events: any[] = [];
  loading = true;

  // Visual Field Logic
  playersA: any[] = [];
  playersB: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchService: MatchService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMatchDetails(id);
    }
  }

  loadMatchDetails(id: string): void {
    this.matchService.getMatch(id).subscribe({
      next: (data) => {
        this.match = data;
        this.generateFieldLayout();
        this.loadEvents(id);
      },
      error: () => this.loading = false
    });
  }

  loadEvents(id: string): void {
    this.matchService.getMatchEvents(id).subscribe({
      next: (data) => {
        this.events = data.sort((a, b) => a.minute - b.minute);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private generateFieldLayout(): void {
    const formation = [
      { x: 50, y: 15 }, // GK
      { x: 20, y: 35 }, { x: 40, y: 35 }, { x: 60, y: 35 }, { x: 80, y: 35 }, // DEF
      { x: 20, y: 60 }, { x: 40, y: 60 }, { x: 60, y: 60 }, { x: 80, y: 60 }, // MID
      { x: 40, y: 85 }, { x: 60, y: 85 }  // ATT
    ];

    const nameA = this.getTeamName(this.match?.equipeA).slice(0, 3).toUpperCase();
    const nameB = this.getTeamName(this.match?.equipeB).slice(0, 3).toUpperCase();

    const roles = ['GK', 'DD', 'DC', 'DC', 'DG', 'MD', 'MC', 'MC', 'MG', 'AT', 'AT'];

    this.playersA = formation.map((pos, i) => ({
      id: i,
      name: `${nameA} ${roles[i]}`,
      pos,
      cards: ''
    }));

    this.playersB = formation.map((pos, i) => ({
      id: i,
      name: `${nameB} ${roles[i]}`,
      pos: { x: pos.x, y: 100 - pos.y },
      cards: ''
    }));
  }

  getTeamName(team: any): string {
    if (!team) return 'ÉQUIPE';
    return (team.name || team.teamName || 'ÉQUIPE').toUpperCase();
  }

  getEventIcon(type: string): string {
    switch (type) {
      case 'GOAL': return '⚽';
      case 'YELLOW_CARD': return '🟨';
      case 'RED_CARD': return '🟥';
      case 'SUBSTITUTION': return '🔄';
      default: return '📍';
    }
  }

  getTranslatedStatus(status?: MatchStatus): string {
     if (!status) return 'INCONNU';
     switch (status) {
       case MatchStatus.PENDING_INVITATION: return 'INVITATION EN ATTENTE';
       case MatchStatus.ACCEPTED: case MatchStatus.SCHEDULED: return 'PROGRAMMÉ';
       case MatchStatus.LIVE: case MatchStatus.IN_PROGRESS: return 'EN DIRECT';
       case MatchStatus.PENDING_VALIDATION: return 'EN ATTENTE DE VALIDATION';
       case MatchStatus.FINISHED: case MatchStatus.COMPLETED: return 'TERMINÉ';
       default: return status;
     }
  }

  goBack(): void {
    this.router.navigate(['/matchs']);
  }
}
