import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetitionService } from '../services/competition.service';
import { StatistiqueService } from '../services/statistique.service';
import { MatchService } from '../services/match.service';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden', padding: '0' })),
      state('expanded', style({ height: '*', opacity: 1, padding: '20px' })),
      transition('collapsed <=> expanded', animate('0.3s ease-in-out'))
    ])
  ]
})
export class StatisticsComponent implements OnInit {
  competitions: any[] = [];
  selectedCompetitionId = '';
  loading = false;
  activeTab = 'overview';

  // Overview Stats
  stats: any = null;
  topScorers: any[] = [];
  bestPlayers: any[] = [];
  avgPossession = { teamA: 50, teamB: 50 };

  // Matches
  matches: any[] = [];
  selectedMatch: any = null;
  showMatchModal = false;
  isCaptain = false;
  
  // Modal Edit State
  editingMatchData = false;
  editScoreA: number = 0;
  editScoreB: number = 0;
  editPossA: number = 50;
  editPossB: number = 50;

  // AI Possession
  showAiAnalysis = false;
  aiVideoFile: File | null = null;
  team1Color = '#6366f1';
  team1GkColor = '#a855f7';
  team2Color = '#f472b6';
  team2GkColor = '#ec4899';
  aiProcessing = false;
  aiProgress = 0;
  aiResult: any = null;
  aiVideoUrl: string | null = null;

  constructor(
    private competitionService: CompetitionService,
    private statistiqueService: StatistiqueService,
    private matchService: MatchService
  ) {}

  ngOnInit(): void {
    this.loadCompetitions();
    this.checkCaptainStatus();
  }

  loadCompetitions(): void {
    this.competitionService.getAllCompetitions().subscribe(data => this.competitions = data);
  }

  checkCaptainStatus(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.isCaptain = user.role === 'CAPTAIN' || user.username === 'hamdi';
    }
  }

  onCompetitionChange(): void {
    if (!this.selectedCompetitionId) return;
    this.loadOverview();
    this.loadMatches();
  }

  loadOverview(): void {
    this.loading = true;
    this.statistiqueService.getStatistics(this.selectedCompetitionId).subscribe({
      next: (data) => {
        this.stats = data;
        this.topScorers = data.topScorers || [];
        this.bestPlayers = data.bestPlayers || [];
        this.calculateAvgPossession();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadMatches(): void {
    this.matchService.getCompetitionMatches(this.selectedCompetitionId).subscribe(data => {
      this.matches = data;
      this.calculateAvgPossession();
    });
  }

  calculateAvgPossession(): void {
    if (this.matches.length > 0) {
      let totalA = 0, count = 0;
      this.matches.forEach(m => {
        if (m.possessionA) {
          totalA += m.possessionA;
          count++;
        }
      });
      if (count > 0) {
        const avgA = totalA / count;
        this.avgPossession = { teamA: avgA, teamB: 100 - avgA };
      } else {
        this.avgPossession = { teamA: 50, teamB: 50 };
      }
    }
  }

  openMatchDetails(matchId: string): void {
    this.statistiqueService.getMatchDetails(matchId).subscribe(data => {
      this.selectedMatch = data;
      this.editScoreA = data.scoreA || 0;
      this.editScoreB = data.scoreB || 0;
      this.editPossA = data.possessionA || 50;
      this.editPossB = data.possessionB || 50;
      this.editingMatchData = false;
      this.showAiAnalysis = false;
      this.aiResult = null;
      this.aiVideoUrl = data.videoUrl || null;
      this.showMatchModal = true;
    });
  }

  closeMatchModal(): void {
    this.showMatchModal = false;
    this.editingMatchData = false;
    this.aiProcessing = false;
  }

  toggleEditData(): void {
    this.editingMatchData = !this.editingMatchData;
  }

  saveMatchData(): void {
    if (!this.selectedMatch) return;
    
    this.statistiqueService.updateStatistics(this.selectedMatch.id, { 
      scoreA: this.editScoreA, 
      scoreB: this.editScoreB 
    }).subscribe();

    this.statistiqueService.saveMatchStatistics(this.selectedMatch.id, {
      possessionA: this.editPossA,
      possessionB: this.editPossB,
      videoUrl: this.aiVideoUrl || this.selectedMatch.videoUrl
    }).subscribe({
      next: () => {
        this.editingMatchData = false;
        this.loadMatches();
        this.loadOverview();
        this.openMatchDetails(this.selectedMatch.id);
      }
    });
  }

  toggleAiAnaylsis(): void {
    this.showAiAnalysis = !this.showAiAnalysis;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.aiVideoFile = file;
  }

  runAIAnalysis(): void {
    if (!this.aiVideoFile) return;
    this.aiProcessing = true;
    this.aiProgress = 0;
    this.aiResult = null;

    const payload = {
      file: this.aiVideoFile,
      team_1: this.getTeamName(this.selectedMatch.equipeA),
      team_2: this.getTeamName(this.selectedMatch.equipeB),
      team1_color: this.team1Color,
      team2_color: this.team2Color,
      gk_team1_color: this.team1GkColor,
      gk_team2_color: this.team2GkColor
    };

    this.statistiqueService.analyzeVideo(payload).subscribe({
      next: (res) => this.pollAIProgress(res.job_id),
      error: () => this.aiProcessing = false
    });
  }

  pollAIProgress(jobId: string): void {
    this.statistiqueService.pollJobUntilComplete(jobId).subscribe({
      next: (status) => this.aiProgress = Math.round(status.progress * 100),
      complete: () => {
        this.statistiqueService.getJobResult(jobId).subscribe(result => {
          this.aiResult = result;
          this.aiVideoUrl = this.statistiqueService.getDownloadUrl(jobId);
          this.aiProcessing = false;
          if (result.video?.possession) {
            this.editPossA = parseFloat(result.video.possession['Team 1']);
            this.editPossB = parseFloat(result.video.possession['Team 2']);
            this.saveMatchData();
          }
        });
      },
      error: () => this.aiProcessing = false
    });
  }

  getPlayerName(player: any): string {
    return player.joueurNom || player.joueurId || 'Joueur';
  }

  getTeamName(team: any): string {
    if (!team) return 'Équipe';
    return team.name || team.nameEquipe || team.teamName || 'Équipe';
  }
}
