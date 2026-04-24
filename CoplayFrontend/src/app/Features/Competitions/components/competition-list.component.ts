import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompetitionService } from '../services/competition.service';

@Component({
  selector: 'app-competition-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="main-background"></div>
      
      <div class="content-overlay container mt-0 pt-5">
        <div *ngIf="loading" class="text-center p-5">
          <div class="spinner-border text-light"></div>
        </div>

        <div class="row justify-content-center align-items-center gap-5 min-vh-75">
          <div class="col-auto" *ngFor="let comp of competitions; let i = index">
            <div class="card shadow-lg competition-card glass-style" 
                 [style.animation-delay]="i * 0.15 + 's'"
                 (click)="goToDetail(comp.id)">
              <div class="card-body text-center p-4">
                
                <h3 class="card-title fw-bold mb-3 text-dark">
                  {{ comp.type === 'LEAGUE' ? 'Championnat' : (comp.type === 'TOURNAMENT' ? 'Coupe' : comp.name) }}
                </h3>
                
                <hr class="mx-auto w-25 mb-3 opacity-25">
                
                <p class="card-text">
                  <span class="text-secondary fw-bold d-block mb-3 small text-uppercase">{{ comp.sport }}</span>
                  <span class="badge rounded-pill px-4 py-2 status-badge" [ngClass]="comp.type === 'LEAGUE' ? 'bg-cyan' : 'bg-blue'">
                    {{ comp.type === 'LEAGUE' ? 'Championnat' : 'Tournoi' }}
                  </span>
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { 
      position: relative; 
      min-height: 100vh; 
      overflow: hidden; 
    }

    .main-background {
      position: absolute; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%;
      background-image: url('/assets/Champion_Coupe.png');
      background-size: cover; 
      background-position: center; 
      z-index: 1;
    }

    .content-overlay { position: relative; z-index: 2; }

    /* Glassmorphism maintenu à 0.45 pour la lisibilité sur fond riche */
    .glass-style {
      background: rgba(255, 255, 255, 0.45) !important; 
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      width: 300px;
      opacity: 0;
      animation: fadeInSmooth 0.8s ease-out forwards;
    }

    .min-vh-75 { min-height: 75vh; }

    .competition-card { 
      cursor: pointer; 
      border-radius: 25px; 
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
    }

    .competition-card:hover { 
      transform: translateY(-12px) scale(1.03); 
      background: rgba(255, 255, 255, 0.65) !important; 
      box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
    }

    .card-title { font-size: 1.5rem; letter-spacing: -0.5px; }
    .status-badge { font-size: 0.85rem; font-weight: 600; }

    @keyframes fadeInSmooth {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .bg-cyan { background-color: #00d2ff; color: #fff; }
    .bg-blue { background-color: #007bff; color: #fff; }
  `]
})
export class CompetitionListComponent implements OnInit {
  competitions: any[] = [];
  loading = true;

  constructor(private competitionService: CompetitionService, private router: Router) {}

  ngOnInit(): void {
    this.competitionService.getAllCompetitions().subscribe({
      next: (data) => {
        this.competitions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur API:', err);
        this.loading = false;
      }
    });
  }

  goToDetail(id: string): void {
    this.router.navigate(['/competitions', id]);
  }
}