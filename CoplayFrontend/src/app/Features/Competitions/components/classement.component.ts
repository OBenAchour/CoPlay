import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetitionService } from '../services/competition.service';
import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-classement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tournament-layout">
      <div class="top-bar">
        <div class="control">
          <select [(ngModel)]="selectedCompetitionId" (change)="loadMatches()">
            <option value="">-- Select Tournament --</option>
            <option *ngFor="let c of competitions" [value]="c.id || c.competitionId">
              {{ c.name }}
            </option>
          </select>
        </div>
      </div>

      <div *ngIf="loading" class="loader">Generating Bracket Lines...</div>

      <div class="bracket-container" *ngIf="!loading && finalMatch">
        
        <div class="wing wing-left">
          <div class="round-column" *ngFor="let r of leftSide; let i = index">
            <div class="match-wrapper" *ngFor="let m of r.matches">
              <div class="match-card">
                <div class="team-slot" [class.winner]="isWinner(m, 'A')">
                  <span class="t-name">{{ m.equipeA.name }}</span>
                  <span class="t-score">{{ m.scoreA }}</span>
                </div>
                <div class="team-slot" [class.winner]="isWinner(m, 'B')">
                  <span class="t-name">{{ m.equipeB.name }}</span>
                  <span class="t-score">{{ m.scoreB }}</span>
                </div>
              </div>
              <div class="connector" *ngIf="i < leftSide.length"></div>
            </div>
          </div>
        </div>

        <div class="center-stage">
          <div class="trophy-box">
            <img src="https://cdn-icons-png.flaticon.com/512/2583/2583344.png" class="trophy" />
          </div>

          <div class="final-container">
            <div class="final-match-card">
              <div class="final-header">FINAL</div>
              <div class="final-teams">
                 <div class="f-team" [class.winner]="isWinner(finalMatch, 'A')">
                   <div class="f-name">{{ finalMatch.equipeA.name }}</div>
                   <div class="f-score">{{ finalMatch.scoreA }}</div>
                 </div>
                 <div class="vs-circle">VS</div>
                 <div class="f-team" [class.winner]="isWinner(finalMatch, 'B')">
                   <div class="f-name">{{ finalMatch.equipeB.name }}</div>
                   <div class="f-score">{{ finalMatch.scoreB }}</div>
                 </div>
              </div>
            </div>
          </div>
          <div class="field-perspective"><div class="field-lines"></div></div>
        </div>

        <div class="wing wing-right">
          <div class="round-column" *ngFor="let r of rightSide; let i = index">
             <div class="match-wrapper" *ngFor="let m of r.matches">
              <div class="connector" *ngIf="i > 0"></div>
              <div class="match-card">
                <div class="team-slot" [class.winner]="isWinner(m, 'A')">
                  <span class="t-score">{{ m.scoreA }}</span>
                  <span class="t-name">{{ m.equipeA.name }}</span>
                </div>
                <div class="team-slot" [class.winner]="isWinner(m, 'B')">
                  <span class="t-score">{{ m.scoreB }}</span>
                  <span class="t-name">{{ m.equipeB.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary-bg: #0d0d0d;
      --card-bg: #1e1e1e;
      --accent: #00e5ff;
      --winner-clr: #00ff88;
      --line-clr: #444;
    }

    .tournament-layout {
      background-color: var(--primary-bg);
      min-height: 100vh;
      padding: 40px;
      color: white;
      font-family: 'Orbitron', sans-serif, Arial;
    }

    .top-bar { text-align: center; margin-bottom: 50px; }
    .logo-text { font-size: 2.2rem; letter-spacing: 8px; text-transform: uppercase; }
    .logo-text span { color: #555; }

    .bracket-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0; /* Gap handled by connectors */
    }

    .wing { display: flex; flex: 1; }
    .wing-left { justify-content: flex-end; }
    .wing-right { justify-content: flex-start; }

    .round-column {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      height: 600px;
      padding: 0 40px;
    }

    .match-wrapper {
      display: flex;
      align-items: center;
      position: relative;
    }

    .match-card {
      background: var(--card-bg);
      width: 180px;
      border-radius: 4px;
      border: 1px solid #333;
      z-index: 2;
    }

    .team-slot {
      display: flex;
      justify-content: space-between;
      padding: 10px 12px;
      font-size: 12px;
      border-bottom: 1px solid #111;
    }

    .team-slot.winner {
      color: var(--winner-clr);
      font-weight: bold;
      background: rgba(0, 255, 136, 0.1);
    }

    /* CONNECTOR LINES LOGIC */
    .connector {
      flex-grow: 1;
      height: 2px;
      background: var(--line-clr);
      min-width: 40px;
      position: relative;
    }

    /* Vertical bars for the bracket tree */
    .wing-left .match-wrapper:nth-child(even) .connector::before {
      content: '';
      position: absolute;
      right: 0;
      bottom: 50%;
      width: 2px;
      height: 100%;
      background: var(--line-clr);
    }

    .wing-right .match-wrapper:nth-child(even) .connector::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: 50%;
      width: 2px;
      height: 100%;
      background: var(--line-clr);
    }

    /* Center Stage */
    .center-stage {
      flex: 0 0 400px;
      text-align: center;
      padding: 0 20px;
    }

    .trophy {
      width: 100px;
      filter: drop-shadow(0 0 15px gold);
      margin-bottom: 20px;
    }

    .final-match-card {
      border: 2px solid gold;
      background: #111;
      padding: 20px;
      border-radius: 10px;
    }

    .final-header { color: gold; margin-bottom: 15px; font-size: 14px; letter-spacing: 3px;}
    .final-teams { display: flex; justify-content: space-around; align-items: center; }
    .f-score { font-size: 28px; font-weight: 900; color: gold; }
    .vs-circle { background: gold; color: #000; padding: 5px 10px; border-radius: 50%; font-weight: bold; font-size: 10px; }

    .field-perspective {
      margin-top: 40px;
      height: 100px;
      background: #1a3317;
      transform: perspective(100px) rotateX(40deg);
      border: 1px solid rgba(255,255,255,0.1);
    }
  `]
})
export class ClassementComponent implements OnInit {
  competitions: any[] = [];
  leftSide: any[] = [];
  rightSide: any[] = [];
  finalMatch: any = null;
  selectedCompetitionId = '';
  loading = false;

  constructor(
    private competitionService: CompetitionService,
    private matchService: MatchService
  ) {}

  ngOnInit(): void {
    this.competitionService.getAllCompetitions().subscribe(data => this.competitions = data);
  }

  loadMatches(): void {
    if (!this.selectedCompetitionId) return;
    this.loading = true;

    this.matchService.getCompetitionMatches(this.selectedCompetitionId).subscribe({
      next: (data: any[]) => {
        const grouped = data.reduce((acc, m) => {
          const r = m.numeroJournee;
          if (!acc[r]) acc[r] = [];
          acc[r].push(m);
          return acc;
        }, {});

        const rounds = Object.keys(grouped).map(Number).sort((a, b) => a - b);
        const lastRound = rounds[rounds.length - 1];

        this.finalMatch = grouped[lastRound][0];

        const left: any[] = [];
        const right: any[] = [];

        rounds.forEach(r => {
          if (r !== lastRound) {
            const matches = grouped[r];
            const half = Math.ceil(matches.length / 2);
            left.push({ round: r, matches: matches.slice(0, half) });
            right.push({ round: r, matches: matches.slice(half) });
          }
        });

        this.leftSide = left; 
        // For the right side, we want the most recent rounds closer to the center
        this.rightSide = right.reverse(); 

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  isWinner(match: any, team: 'A' | 'B'): boolean {
    if (!match || match.status !== 'FINISHED') return false;
    return team === 'A' ? match.scoreA > match.scoreB : match.scoreB > match.scoreA;
  }
}