import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetitionService } from '../services/competition.service';
import { StatistiqueService } from '../services/statistique.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>Statistiques des Compétitions</h2>
      
      <div class="mb-3">
        <label class="form-label">Sélectionner une compétition:</label>
        <select class="form-select" [(ngModel)]="selectedCompetitionId" (change)="loadStats()">
          <option value="">-- Choisir --</option>
          <option *ngFor="let comp of competitions" [value]="comp.id || comp.competitionId">
            {{comp.name}}
          </option>
        </select>
      </div>

      <div *ngIf="loading" class="text-center">Chargement...</div>

      <div *ngIf="!loading && selectedCompetitionId">
        <div class="row">
          <div class="col-md-6">
            <div class="card mb-4">
              <div class="card-header bg-warning text-dark">Top Buteurs</div>
              <div class="card-body p-0">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item d-flex justify-content-between" 
                      *ngFor="let player of topScorers; let i = index">
                    <span><strong>{{i + 1}}.</strong> {{getPlayerName(player)}}</span>
                    <span class="badge bg-warning text-dark">{{player.buts || 0}} buts</span>
                  </li>
                  <li *ngIf="topScorers.length === 0" class="list-group-item text-muted">
                    Aucune donnée
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card mb-4">
              <div class="card-header bg-success text-white">Meilleurs Joueurs</div>
              <div class="card-body p-0">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item d-flex justify-content-between"
                      *ngFor="let player of bestPlayers; let i = index">
                    <span><strong>{{i + 1}}.</strong> {{getPlayerName(player)}}</span>
                    <span class="badge bg-success">{{player.points || 0}} pts</span>
                  </li>
                  <li *ngIf="bestPlayers.length === 0" class="list-group-item text-muted">
                    Aucune donnée
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card mb-4">
              <div class="card-header bg-primary text-white">Étoiles</div>
              <div class="card-body p-0">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item d-flex justify-content-between"
                      *ngFor="let player of topStars; let i = index">
                    <span><strong>{{i + 1}}.</strong> {{getPlayerName(player)}}</span>
                    <span class="badge bg-primary">{{player.etoiles || 0}} étoiles</span>
                  </li>
                  <li *ngIf="topStars.length === 0" class="list-group-item text-muted">
                    Aucune donnée
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card mb-4">
              <div class="card-header bg-info text-white">Meilleures Passes</div>
              <div class="card-body p-0">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item d-flex justify-content-between"
                      *ngFor="let player of topPassers; let i = index">
                    <span><strong>{{i + 1}}.</strong> {{getPlayerName(player)}}</span>
                    <span class="badge bg-info">{{player.passesDecisives || 0}} passes</span>
                  </li>
                  <li *ngIf="topPassers.length === 0" class="list-group-item text-muted">
                    Aucune donnée
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatisticsComponent implements OnInit {
  competitions: any[] = [];
  selectedCompetitionId = '';
  topScorers: any[] = [];
  bestPlayers: any[] = [];
  topStars: any[] = [];
  topPassers: any[] = [];
  loading = false;

  constructor(
    private competitionService: CompetitionService,
    private statistiqueService: StatistiqueService
  ) {}

  ngOnInit(): void {
    this.loadCompetitions();
  }

  loadCompetitions(): void {
    this.competitionService.getAllCompetitions().subscribe({
      next: (data) => { this.competitions = data; }
    });
  }

  loadStats(): void {
    if (!this.selectedCompetitionId) return;
    this.loading = true;
    
    this.statistiqueService.getTopScorers(this.selectedCompetitionId).subscribe({
      next: (data) => { this.topScorers = data; }
    });
    
    this.statistiqueService.getBestPlayers(this.selectedCompetitionId).subscribe({
      next: (data) => { this.bestPlayers = data; }
    });
    
    this.statistiqueService.getTopStars(this.selectedCompetitionId).subscribe({
      next: (data) => { this.topStars = data; }
    });
    
    this.statistiqueService.getTopPassers(this.selectedCompetitionId).subscribe({
      next: (data) => { this.topPassers = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getPlayerName(player: any): string {
    return player.joueur?.displayName || player.joueurId || 'Joueur';
  }
}
