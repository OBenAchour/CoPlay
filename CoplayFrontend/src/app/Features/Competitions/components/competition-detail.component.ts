import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import unique
import { FormsModule } from '@angular/forms'; // Import unique
import { ActivatedRoute } from '@angular/router';
import { CompetitionService } from '../services/competition.service';
import { StatistiqueService } from '../services/statistique.service';
import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-competition-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <div class="main-background"></div>

      <div class="content-overlay container py-5" *ngIf="competition">
        
        <div class="glass-card p-4 mb-4 shadow-lg text-white">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="display-6 fw-bold mb-1">{{competition.name}}</h1>
              <div class="d-flex gap-2">
                <span class="badge bg-primary rounded-pill px-3">{{competition.sport}}</span>
                <span class="badge bg-info rounded-pill px-3">
                  {{competition.type === 'LEAGUE' ? 'Championnat' : 'Tournoi'}}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card p-2 mb-4">
          <ul class="nav nav-pills nav-fill">
            <li class="nav-item">
              <button class="nav-link text-white" [class.active]="activeTab === 'classement'" 
                      (click)="activeTab = 'classement'">Classement</button>
            </li>
            <li class="nav-item">
              <button class="nav-link text-white" [class.active]="activeTab === 'matchs'" 
                      (click)="activeTab = 'matchs'">Matchs</button>
            </li>
            <li class="nav-item">
              <button class="nav-link text-white" [class.active]="activeTab === 'stats'" 
                      (click)="activeTab = 'stats'">Statistiques</button>
            </li>
          </ul>
        </div>

        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-light"></div>
        </div>

        <div class="dynamic-content" *ngIf="!loading">
          
          <div *ngIf="activeTab === 'classement'" class="glass-card p-4 animate-fade-in">
            <h4 class="text-white mb-4">Classement</h4>
            <div class="table-responsive">
              <table class="table table-hover text-white custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Équipe</th>
                    <th class="text-center">MJ</th>
                    <th class="text-center">V</th>
                    <th class="text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let team of classement; let i = index">
                    <td><span class="rank-badge">{{i + 1}}</span></td>
                    <td class="fw-bold">{{team.equipeName || team.equipeId}}</td>
                    <td class="text-center">{{team.matchsJoues || 0}}</td>
                    <td class="text-center">{{team.victoires || 0}}</td>
                    <td class="text-center"><strong class="cyan-text">{{team.points || 0}}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div *ngIf="activeTab === 'matchs'" class="row g-3 animate-fade-in">
            <div class="col-md-6" *ngFor="let match of matches">
              <div class="glass-card p-3">
                <div class="d-flex justify-content-between align-items-center text-white">
                  <span class="flex-grow-1 text-end pe-2">{{getTeamName(match.equipeA)}}</span>
                  <span class="score-pill">{{match.scoreA ?? '?'}} - {{match.scoreB ?? '?'}}</span>
                  <span class="flex-grow-1 ps-2 text-start">{{getTeamName(match.equipeB)}}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { position: relative; min-height: 100vh; }

    .main-background {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
                  url('/assets/Championnat.png');
      background-size: cover; background-position: center; z-index: -1;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 15px;
    }

    .nav-pills .nav-link.active { background-color: #00d2ff !important; }
    .cyan-text { color: #00d2ff; }
    .score-pill { background: #00d2ff; padding: 2px 10px; border-radius: 5px; font-weight: bold; }
    .custom-table tr { border-bottom: 1px solid rgba(255, 255, 255, 0.1); transition: 0.3s; }
    .custom-table tr:hover { background: rgba(255, 255, 255, 0.05); }
    .animate-fade-in { animation: fadeIn 0.4s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class CompetitionDetailComponent implements OnInit {
  competition: any = null;
  classement: any[] = [];
  matches: any[] = [];
  loading = false;
  activeTab = 'classement';
  competitionId = '';

  constructor(
    private route: ActivatedRoute,
    private competitionService: CompetitionService,
    private statistiqueService: StatistiqueService,
    private matchService: MatchService
  ) {}

  ngOnInit(): void {
    this.competitionId = this.route.snapshot.paramMap.get('id') || '';
    if (this.competitionId) this.loadCompetition();
  }

  loadCompetition(): void {
    this.loading = true;
    this.competitionService.getCompetition(this.competitionId).subscribe({
      next: (data) => {
        this.competition = data;
        this.loadClassement();
        this.loadMatches();
      },
      error: () => this.loading = false
    });
  }

  loadClassement(): void {
    this.statistiqueService.getClassement(this.competitionId).subscribe({
      next: (data) => this.classement = data
    });
  }

  loadMatches(): void {
    this.matchService.getCompetitionMatches(this.competitionId).subscribe({
      next: (data) => { this.matches = data; this.loading = false; }
    });
  }

  getTeamName(team: any): string { return team?.name || team?.teamId || 'Équipe'; }
}