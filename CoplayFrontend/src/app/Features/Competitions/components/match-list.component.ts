import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetitionService } from '../services/competition.service';
import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>Matchs des Compétitions</h2>
      
      <div class="mb-3">
        <label class="form-label">Compétition:</label>
        <select class="form-select" [(ngModel)]="selectedCompetitionId" (change)="loadMatches()">
          <option value="">-- Choisir --</option>
          <option *ngFor="let comp of competitions" [value]="comp.id || comp.competitionId">
            {{comp.name}}
          </option>
        </select>
      </div>

      <div *ngIf="loading" class="text-center">Chargement...</div>

      <div *ngIf="!loading && filteredMatches.length > 0">
        <div class="row">
          <div class="col-md-6 mb-3" *ngFor="let match of filteredMatches">
            <div class="card">
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-5">
                    <h5>{{getTeamName(match.equipeA)}}</h5>
                  </div>
                  <div class="col-2">
                    <span class="fs-4 fw-bold">
                      {{match.scoreA !== null ? match.scoreA : '?'}} - {{match.scoreB !== null ? match.scoreB : '?'}}
                    </span>
                  </div>
                  <div class="col-5">
                    <h5>{{getTeamName(match.equipeB)}}</h5>
                  </div>
                </div>
                <p class="text-center text-muted mb-1">{{match.dateMatch}}</p>
                <p class="text-center">
                  <span class="badge bg-secondary">{{match.status}}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && selectedCompetitionId && filteredMatches.length === 0" class="alert alert-info">
        Aucun match trouvé
      </div>
    </div>
  `
})
export class MatchListComponent implements OnInit {
  competitions: any[] = [];
  allMatches: any[] = [];
  filteredMatches: any[] = [];
  selectedCompetitionId = '';
  loading = false;

  constructor(
    private competitionService: CompetitionService,
    private matchService: MatchService
  ) {}

  ngOnInit(): void {
    this.loadCompetitions();
  }

  loadCompetitions(): void {
    this.competitionService.getAllCompetitions().subscribe({
      next: (data) => { this.competitions = data; }
    });
  }

  loadMatches(): void {
    if (!this.selectedCompetitionId) return;
    this.loading = true;
    this.matchService.getCompetitionMatches(this.selectedCompetitionId).subscribe({
      next: (data) => { 
        this.allMatches = data; 
        this.filteredMatches = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getTeamName(team: any): string {
    return team?.name || team?.teamId || 'Équipe';
  }
}
