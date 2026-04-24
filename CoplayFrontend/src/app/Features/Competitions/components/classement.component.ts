import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetitionService } from '../services/competition.service';
import { StatistiqueService } from '../services/statistique.service';

@Component({
  selector: 'app-classement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>Classements des Compétitions</h2>
      
      <div class="mb-3">
        <label class="form-label">Sélectionner une compétition:</label>
        <select class="form-select" [(ngModel)]="selectedCompetitionId" (change)="loadClassement()">
          <option value="">-- Choisir --</option>
          <option *ngFor="let comp of competitions" [value]="comp.id || comp.competitionId">
            {{comp.name}} ({{comp.type === 'LEAGUE' ? 'Championnat' : 'Tournoi'}})
          </option>
        </select>
      </div>

      <div *ngIf="loading" class="text-center">Chargement...</div>

      <div *ngIf="classement.length > 0 && !loading">
        <h4>Classement</h4>
        <table class="table table-striped">
          <thead class="table-dark">
            <tr>
              <th>Rang</th>
              <th>Équipe</th>
              <th>MJ</th>
              <th>V</th>
              <th>N</th>
              <th>D</th>
              <th>BP</th>
              <th>BC</th>
              <th>DB</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let team of classement; let i = index">
              <td>{{i + 1}}</td>
              <td><strong>{{team.equipeName || team.equipeId}}</strong></td>
              <td>{{team.matchsJoues || 0}}</td>
              <td class="text-success">{{team.victoires || 0}}</td>
              <td>{{team.nuls || 0}}</td>
              <td class="text-danger">{{team.defaites || 0}}</td>
              <td>{{team.butsPour || 0}}</td>
              <td>{{team.butsContre || 0}}</td>
              <td>{{(team.butsPour || 0) - (team.butsContre || 0)}}</td>
              <td><strong>{{team.points || 0}}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="selectedCompetitionId && classement.length === 0 && !loading" class="alert alert-info">
        Aucun classement disponible
      </div>
    </div>
  `
})
export class ClassementComponent implements OnInit {
  competitions: any[] = [];
  classement: any[] = [];
  selectedCompetitionId = '';
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

  loadClassement(): void {
    if (!this.selectedCompetitionId) return;
    this.loading = true;
    this.statistiqueService.getClassement(this.selectedCompetitionId).subscribe({
      next: (data) => { this.classement = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
