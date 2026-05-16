import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  StatistiqueService,
  JobStatusResponse,
  JobResultResponse
} from '../services/statistique.service';

interface MatchEntry {
  jobId: string;
  team1: string;
  team2: string;
  team1Color: string;
  team2Color: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  possessionTeam1?: string;
  possessionTeam2?: string;
  dominantTeam?: string;
  processingTime?: number;
  timestamp: Date;
}

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.css']
})
export class MatchListComponent implements OnInit {

  matches: MatchEntry[] = [];

  constructor(
    private statistiqueService: StatistiqueService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFromStorage();
  }

  addMatch(entry: MatchEntry): void {
    this.matches.unshift(entry);
    this.saveToStorage();
  }

  removeMatch(index: number): void {
    this.matches.splice(index, 1);
    this.saveToStorage();
  }

  viewDetails(match: MatchEntry): void {
    if (match.status === 'completed') {
      this.router.navigate(['/competitions/statistics'], {
        queryParams: { jobId: match.jobId, team1: match.team1, team2: match.team2 }
      });
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'uploading': return 'Uploading…';
      case 'processing': return 'Processing…';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  downloadVideo(match: MatchEntry): void {
    if (match.jobId) {
      window.open(this.statistiqueService.getDownloadUrl(match.jobId), '_blank');
    }
  }

  refreshStatus(match: MatchEntry): void {
    if (match.status === 'processing' || match.status === 'uploading') {
      this.statistiqueService.getJobStatus(match.jobId).subscribe({
        next: (s: JobStatusResponse) => {
          match.progress = Math.round((s.progress || 0) * 100);
          if (s.status === 'completed') {
            match.status = 'completed';
            this.fetchMatchResult(match);
          } else if (s.status === 'failed') {
            match.status = 'failed';
          }
          this.saveToStorage();
        }
      });
    }
  }

  fetchMatchResult(match: MatchEntry): void {
    this.statistiqueService.getJobResult(match.jobId).subscribe({
      next: (res: JobResultResponse) => {
        if (res.video?.possession) {
          match.possessionTeam1 = res.video.possession['Team 1'];
          match.possessionTeam2 = res.video.possession['Team 2'];
          const p1 = parseFloat((match.possessionTeam1 || '0').replace('%', ''));
          const p2 = parseFloat((match.possessionTeam2 || '0').replace('%', ''));
          match.dominantTeam = p1 >= p2 ? match.team1 : match.team2;
        }
        match.processingTime = res.processing_time_seconds;
        match.status = 'completed';
        this.saveToStorage();
      }
    });
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('match_history', JSON.stringify(this.matches));
    } catch (_) {}
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem('match_history');
      if (raw) {
        this.matches = JSON.parse(raw).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (_) {
      this.matches = [];
    }
  }

  trackByJob(_: number, match: MatchEntry): string {
    return match.jobId;
  }
}
