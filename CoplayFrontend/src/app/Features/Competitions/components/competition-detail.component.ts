import { Component, OnInit, OnDestroy, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import localeFr from '@angular/common/locales/fr';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CompetitionService } from '../services/competition.service';
import { StatistiqueService } from '../services/statistique.service';
import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { MatchService } from '../services/match.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

registerLocaleData(localeFr);

@Component({
  selector: 'app-competition-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
  templateUrl: './competition-detail.component.html',
  styleUrls: ['./competition-detail.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('modalAnim', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))])
    ])
  ]
})
export class CompetitionDetailComponent implements OnInit, OnDestroy {

  
  competition: any = null;
  classement: any[] = [];
  matches: any[] = [];
  loading = false;
  activeTab = 'classement';
  competitionId = '';

  currentUser: any = null;
  isAdmin = false;
  isCaptain = false;
  private readonly CACHE_KEY = 'comp_cache_';

  // Classement
  hoveredOpponentId: string | null = null;
  sortField = 'points';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Match editing
  editingMatchId: string | null = null;

  // Analysis Modal
  showAnalysisModal = false;
  selectedMatch: any = null;
  analysisLoading = false;
  analysisProgress = 0;
  analysisFile: File | null = null;
  colorMode: 'auto' | 'manual' = 'auto';
  team1Color = '#4f46e5';
  team1GkColor = '#a855f7';
  team2Color = '#f43f5e';
  team2GkColor = '#f59e0b';

  // Manual Color Calibration
  isExtractingFrames = false;
  extractedFrames: string[] = [];
  activePickingTeam: 'teamA' | 'teamB' = 'teamA';
  manualTeamAColor: string | null = null;
  manualTeamBColor: string | null = null;

  // Match filter
  matchFilter: 'all' | 'played' | 'upcoming' = 'all';

  // View Analysis
  showViewModal = false;
  viewData: any = null;
  viewPitchPlayers: { teamA: any[], teamB: any[] } = { teamA: [], teamB: [] };

  // Position
  hoveredPlayer: any = null;

  // Default formations
  defaultTeamA = [
    { x: 8, y: 50, name: 'Gardien', role: 'GK', num: 1 },
    { x: 25, y: 12, name: 'Latéral G.', role: 'LB', num: 3 },
    { x: 25, y: 37, name: 'Défenseur', role: 'CB', num: 4 },
    { x: 25, y: 63, name: 'Défenseur', role: 'CB', num: 5 },
    { x: 25, y: 88, name: 'Latéral D.', role: 'RB', num: 2 },
    { x: 50, y: 12, name: 'Milieu G.', role: 'LM', num: 7 },
    { x: 50, y: 37, name: 'Milieu C.', role: 'CM', num: 8 },
    { x: 50, y: 63, name: 'Milieu C.', role: 'CM', num: 6 },
    { x: 50, y: 88, name: 'Milieu D.', role: 'RM', num: 11 },
    { x: 78, y: 35, name: 'Attaquant', role: 'ST', num: 9 },
    { x: 78, y: 65, name: 'Attaquant', role: 'ST', num: 10 }
  ];
  defaultTeamB = [
    { x: 8, y: 50, name: 'Gardien', role: 'GK', num: 1 },
    { x: 25, y: 12, name: 'Latéral G.', role: 'LB', num: 3 },
    { x: 25, y: 37, name: 'Défenseur', role: 'CB', num: 4 },
    { x: 25, y: 63, name: 'Défenseur', role: 'CB', num: 5 },
    { x: 25, y: 88, name: 'Latéral D.', role: 'RB', num: 2 },
    { x: 48, y: 25, name: 'Milieu', role: 'CM', num: 6 },
    { x: 48, y: 50, name: 'Milieu', role: 'CM', num: 8 },
    { x: 48, y: 75, name: 'Milieu', role: 'CM', num: 10 },
    { x: 75, y: 18, name: 'Ailier G.', role: 'LW', num: 7 },
    { x: 80, y: 50, name: 'Attaquant', role: 'ST', num: 9 },
    { x: 75, y: 82, name: 'Ailier D.', role: 'RW', num: 11 }
  ];

  // Stats counters
  animCounters: { [k: string]: number | undefined } = {};
  private _intervals: any[] = [];

  // Bracket
  bracketRounds: any[] = [];
  bracketLeft: any[] = [];
  bracketRight: any[] = [];
  bracketFinal: any = null;

  // Calendrier filters
  calendarFilter: 'yesterday' | 'today' | 'tomorrow' | 'all' = 'all';

  // Countdown
  countdown: string = '';
  private _countdownInterval: any = null;

  // Toast
  toasts: { message: string, type: 'success' | 'error' | 'info', id: number }[] = [];
  private _toastId = 0;

  // Processing matches (local tracking while ML runs)
  processingMatches: Set<string> = new Set();

  constructor(
    private route: ActivatedRoute,
    private competitionService: CompetitionService,
    private statistiqueService: StatistiqueService,
    private matchService: MatchService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) { this.checkRole(); }

  sanitizeUrl(url: string | null | undefined): SafeUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnInit(): void {
    this.checkRole();
    this.competitionId = this.route.snapshot.paramMap.get('id') || '';
    if (this.competitionId) { this.loadFromCache(); this.loadCompetition(); }
  }

  ngOnDestroy(): void {
    this._intervals.forEach(i => clearInterval(i));
    if (this._countdownInterval) clearInterval(this._countdownInterval);
  }

  checkRole(): void {
    const role = (this.authService.getUserRole() || '').toUpperCase();
    const email = localStorage.getItem('user_email') || '';
    const name  = localStorage.getItem('user_name')  || '';

    this.currentUser = { email, name, role };
    this.isAdmin   = this.authService.isAdmin();
    this.isCaptain = role === 'CAPTAIN' || role === 'COACH';
  }

  // Helper for template logic
  canAnalyzeMatch(m: any): boolean {
    if (this.isAdmin) return true;
    if (!this.isCaptain || !this.currentUser) return false;
    
    // For now, if role is CAPTAIN, we allow analysis trigger (backend will verify team membership)
    return true;
  }

  canEdit(): boolean { return this.isAdmin || this.isCaptain; }

  canEditMatch(m: any): boolean {
    return this.canAnalyzeMatch(m);
  }

  private loadFromCache(): void {
    try {
      const c = JSON.parse(localStorage.getItem(this.CACHE_KEY + this.competitionId) || 'null');
      if (c) { this.competition = c.competition; this.classement = c.classement || []; this.matches = c.matches || []; }
    } catch { }
  }

  private saveCache(): void {
    try { localStorage.setItem(this.CACHE_KEY + this.competitionId, JSON.stringify({ competition: this.competition, classement: this.classement, matches: this.matches })); } catch { }
  }

  loadCompetition(): void {
    if (!this.competition) this.loading = true;
    this.competitionService.getCompetition(this.competitionId).pipe(tap(d => this.competition = d), catchError(() => of(null)))
      .subscribe(() => { this.loadClassement(); this.loadMatches(); });
  }

  loadClassement(): void {
    this.statistiqueService.getClassement(this.competitionId).subscribe({ next: d => { this.classement = d; this.saveCache(); } });
  }

  loadMatches(): void {
    this.matchService.getCompetitionMatches(this.competitionId).subscribe({
      next: d => {
        this.matches = d.sort((a: any, b: any) => new Date(a.dateMatch).getTime() - new Date(b.dateMatch).getTime());
        this.loading = false; this.saveCache(); this.buildBracket();
      },
      error: () => this.loading = false
    });
  }

  switchTab(t: string): void {
    this.activeTab = t;
    if (t === 'stats') setTimeout(() => this.runCounters(), 100);
    if (t === 'calendrier') this.buildBracket();
  }

  // ─── Toast ───
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const id = ++this._toastId;
    this.toasts.push({ message, type, id });
    setTimeout(() => this.toasts = this.toasts.filter(t => t.id !== id), 4000);
  }

  // ─── Helpers ───
  getTeamName(t: any): string { if (!t) return 'Équipe'; return t.name || t.teamName || t.equipeId || 'Équipe'; }
  getTeamId(t: any): string { if (!t) return ''; return t.teamId || t.equipeId || t.id || 'unknown'; }
  isFinished(m: any): boolean { return m.status === 'FINISHED' || (m.scoreA != null && m.scoreB != null); }

  getFilteredMatchList(): any[] {
    if (this.matchFilter === 'played') return this.matches.filter(m => m.scoreA != null && m.scoreB != null);
    if (this.matchFilter === 'upcoming') return this.matches.filter(m => m.scoreA == null || m.scoreB == null);
    return this.matches;
  }

  getMlStatus(m: any): string {
    if (!m) return 'NONE';
    if (this.processingMatches.has(m.id)) return 'PROCESSING';
    if (m.mlStatus === 'PROCESSING' || m.status === 'PROCESSING') return 'PROCESSING';
    if (m.videoUrl || m.mlStatus === 'COMPLETED' || m.mlStatus === 'PROCESSED' || m.status === 'PROCESSED') return 'COMPLETED';
    return 'NONE';
  }

  getMlStatusLabel(m: any): string {
    const s = this.getMlStatus(m);
    if (s === 'COMPLETED') return '✅ Analysé';
    if (s === 'PROCESSING') return '⏳ En cours';
    return '❌ Non analysé';
  }

  getMlStatusClass(m: any): string {
    const s = this.getMlStatus(m);
    if (s === 'COMPLETED') return 'st-done';
    if (s === 'PROCESSING') return 'st-processing';
    return 'st-none';
  }

  getMatchStatusLabel(m: any): string {
    const ml = this.getMlStatus(m);
    if (ml === 'COMPLETED') return '🏁 TERMINÉ';
    if (ml === 'PROCESSING') return "⏳ EN COURS D'ANALYSE";
    if (this.isFinished(m)) return '🏁 TERMINÉ';
    return '⏳ À VENIR';
  }

  getMatchStatusClass(m: any): string {
    if (this.getMlStatus(m) === 'COMPLETED') return 'st-done';
    if (this.getMlStatus(m) === 'PROCESSING') return 'st-processing';
    if (this.isFinished(m)) return 'st-fin';
    return 'st-pend';
  }

  // ─── Classement ───
  toggleSort(f: string): void { this.sortField === f ? (this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc') : (this.sortField = f, this.sortOrder = 'desc'); }

  getSortedClassement(): any[] {
    return [...this.classement].sort((a, b) => {
      let vA = a[this.sortField] ?? 0, vB = b[this.sortField] ?? 0;
      if (this.sortField === 'diff') { vA = (a.goalsFor || 0) - (a.goalsAgainst || 0); vB = (b.goalsFor || 0) - (b.goalsAgainst || 0); }
      return this.sortOrder === 'asc' ? vA - vB : vB - vA;
    });
  }

  getForm(team: any): any[] {
    const id = this.getTeamId(team);
    const res = this.matches.filter(m => this.isFinished(m)).filter(m => this.getTeamId(m.equipeA) === id || this.getTeamId(m.equipeB) === id)
      .sort((a, b) => new Date(b.dateMatch).getTime() - new Date(a.dateMatch).getTime()).slice(0, 5).map(m => {
        const isA = this.getTeamId(m.equipeA) === id;
        const my = isA ? m.scoreA : m.scoreB, op = isA ? m.scoreB : m.scoreA;
        const opp = isA ? m.equipeB : m.equipeA;
        let r = 'D', f = 'Nul';
        if (my > op) { r = 'W'; f = 'Victoire'; } else if (my < op) { r = 'L'; f = 'Défaite'; }
        return { result: r, resultFull: f, opponentId: this.getTeamId(opp), opponentName: this.getTeamName(opp) };
      });
    return res.length ? res : [{ result: 'W', resultFull: '-', opponentId: '', opponentName: '-' }, { result: 'D', resultFull: '-', opponentId: '', opponentName: '-' }];
  }

  onFormHover(id: string): void { this.hoveredOpponentId = id; }
  onFormLeave(): void { this.hoveredOpponentId = null; }

  // ─── Match Tab ───
  saveScore(m: any): void {
    if (m.scoreA == null || m.scoreB == null || m.scoreA < 0 || m.scoreB < 0) {
      this.showToast('Scores invalides. Veuillez entrer des valeurs ≥ 0.', 'error');
      return;
    }
    this.statistiqueService.updateStatistics(m.id, { scoreA: m.scoreA, scoreB: m.scoreB }).subscribe({
      next: () => {
        this.editingMatchId = null;
        this.showToast('Score mis à jour avec succès !', 'success');
        this.loadMatches(); this.loadClassement();
      },
      error: () => this.showToast('Erreur lors de la mise à jour du score.', 'error')
    });
  }

  // ─── Match Card Click ───
  onMatchCardClick(m: any): void {
    if (this.editingMatchId === m.id) return; 
    this.viewAnalysis(m);
  }

  isMatchClickable(m: any): boolean {
    return true;
  }

  // ─── Analysis Modal ───
  openAnalysisModal(m: any, event: Event): void {
    event.stopPropagation();
    this.selectedMatch = m;
    this.analysisFile = null;
    this.analysisLoading = false;
    this.analysisProgress = 0;
    this.showAnalysisModal = true;
  }

  closeAnalysisModal(): void {
    this.showAnalysisModal = false;
    this.extractedFrames.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    this.extractedFrames = [];
    this.manualTeamAColor = null;
    this.manualTeamBColor = null;
  }

  onFileSelected(e: any): void {
    this.analysisFile = e.target.files?.[0] || null;
    this.manualTeamAColor = null;
    this.manualTeamBColor = null;
    if (this.analysisFile) {
      this.extractFrames(this.analysisFile);
    }
  }

  extractFrames(file: File): void {
    this.isExtractingFrames = true;
    this.extractedFrames.forEach(url => URL.revokeObjectURL(url));
    this.extractedFrames = [];

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const timestamps = [duration * 0.15, duration * 0.45, duration * 0.75];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      let framesCaptured = 0;

      const capture = (index: number) => {
        if (index >= timestamps.length) {
          this.isExtractingFrames = false;
          URL.revokeObjectURL(video.src);
          return;
        }

        video.currentTime = timestamps[index];
        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          this.extractedFrames.push(canvas.toDataURL('image/jpeg', 0.8));
          capture(index + 1);
        };
      };

      capture(0);
    };
  }

  pickColor(event: MouseEvent, imgElement: HTMLImageElement): void {
    const rect = imgElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * imgElement.naturalWidth;
    const y = ((event.clientY - rect.top) / rect.height) * imgElement.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return;
    ctx.drawImage(imgElement, 0, 0);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);

    if (this.activePickingTeam === 'teamA') {
      this.team1Color = hex;
      this.manualTeamAColor = hex;
    } else {
      this.team2Color = hex;
      this.manualTeamBColor = hex;
    }
  }

  runAnalysis(): void {
    if (!this.analysisFile || !this.selectedMatch) return;
    this.analysisLoading = true; this.analysisProgress = 0;
    const matchId = this.selectedMatch.id;
    this.processingMatches.add(matchId);

    // Save PROCESSING status to backend immediately
    this.statistiqueService.saveMatchStatistics(matchId, { mlStatus: 'PROCESSING' }).subscribe();

    const payload: any = {
      file: this.analysisFile,
      team_1: this.getTeamName(this.selectedMatch.equipeA),
      team_2: this.getTeamName(this.selectedMatch.equipeB),
    };

    // Only send jersey colors in Manual mode
    if (this.colorMode === 'manual') {
      payload.team1_color = this.team1Color;
      payload.team2_color = this.team2Color;
      payload.gk_team1_color = this.team1GkColor;
      payload.gk_team2_color = this.team2GkColor;
    }

    this.statistiqueService.analyzeVideo(payload).subscribe({
      next: r => {
        this.showToast('Analyse soumise ! Traitement en cours...', 'info');
        this.closeAnalysisModal();
        this.pollJob(r.job_id, matchId);
      },
      error: (err) => {
        this.analysisLoading = false;
        this.processingMatches.delete(matchId);
        const msg = err?.error?.error || 'Erreur lors de la soumission de l\'analyse.';
        this.showToast(msg, 'error');
      }
    });
  }

  private pollJob(jobId: string, matchId: string): void {
    this.statistiqueService.pollJobUntilComplete(jobId).subscribe({
      next: s => { if (s.progress) this.analysisProgress = Math.round(s.progress * 100); },
      complete: () => {
        this.statistiqueService.getJobResult(jobId).subscribe({
          next: res => {
            const downloadUrl = this.statistiqueService.getDownloadUrl(jobId);

            // Parse possession — handle dynamic team name keys from ML
            const possession = res.video?.possession || {};
            const possKeys = Object.keys(possession);
            const rawA = possKeys.length > 0 ? possession[possKeys[0]] : '50';
            const rawB = possKeys.length > 1 ? possession[possKeys[1]] : '50';
            const possA = parseFloat(rawA.toString().replace('%', '').trim());
            const possB = parseFloat(rawB.toString().replace('%', '').trim());

            const statsPayload: any = {
              possessionA: isNaN(possA) ? 50 : possA,
              possessionB: isNaN(possB) ? 50 : possB,
              videoUrl: downloadUrl,
              mlStatus: 'COMPLETED',
              mlJobId: jobId,
              mlSummaryJson: JSON.stringify(res)
            };


            this.statistiqueService.saveMatchStatistics(matchId, statsPayload).subscribe({
              next: () => {
                this.analysisLoading = false;
                this.showAnalysisModal = false;
                this.showViewModal = false;
                this.processingMatches.delete(matchId);
                this.showToast('Analyse terminée avec succès ! ✅', 'success');
                this.loadMatches();
              },
              error: (err) => {
                console.error('SAVE STATS ERROR:', err);
                console.error('Response status:', err?.status, 'Body:', err?.error);
                this.analysisLoading = false;
                this.processingMatches.delete(matchId);
                // DO NOT reset mlStatus — ML succeeded, only backend save failed
                this.showToast('Erreur sauvegarde: ' + (err?.error?.message || err?.statusText || 'vérifiez la console'), 'error');
              }
            });
          },
          error: (err) => {
            console.error('GET RESULT ERROR:', err);
            this.analysisLoading = false;
            this.processingMatches.delete(matchId);
            this.showToast('Erreur lors de la récupération des résultats.', 'error');
          }
        });
      },
      error: (err) => {
        console.error('POLL JOB ERROR:', err);
        this.analysisLoading = false;
        this.processingMatches.delete(matchId);
        // Only reset to NONE if the ML ITSELF failed (not a backend save issue)
        this.statistiqueService.saveMatchStatistics(matchId, { mlStatus: 'NONE' }).subscribe({
          error: () => console.warn('Could not reset mlStatus')
        });
        this.showToast('L\'analyse a échoué.', 'error');
      }
    });
  }

  viewAnalysis(m: any): void {
    const possA = m.possessionA || 50;
    const possB = m.possessionB || 50;
    this.viewData = {
      videoUrl: m.videoUrl,
      possA, possB,
      teamA: this.getTeamName(m.equipeA),
      teamB: this.getTeamName(m.equipeB),
      formationA: m.formationA || '4-4-2',
      formationB: m.formationB || '4-3-3',
      mlStatus: this.getMlStatus(m),
      mlSummary: null,
      match: m
    };
    
    this.selectedMatch = m;

    // Parse ML summary if available
    if (m.mlSummaryJson) {
      try { this.viewData.mlSummary = JSON.parse(m.mlSummaryJson); } catch {}
    }

    // Build pitch players from ML data or defaults
    this.buildPitchPlayers(this.viewData.mlSummary);
    this.showViewModal = true;
  }

  // Action to trigger analysis from the viewer modal's empty state
  triggerModalAnalysis(): void {
    if (this.selectedMatch) {
      this.openAnalysisModal(this.selectedMatch, new MouseEvent('click'));
      this.closeViewModal();
    }
  }

  private buildPitchPlayers(summary: any): void {
    // If ML summary has position data, use it; otherwise use defaults
    if (summary?.detections?.player_positions) {
      // Map ML positions to pitch coordinates
      const positions = summary.detections.player_positions;
      this.viewPitchPlayers = {
        teamA: (positions.team1 || []).map((p: any, i: number) => ({
          x: p.x || this.defaultTeamA[i]?.x || 50,
          y: p.y || this.defaultTeamA[i]?.y || 50,
          name: p.name || `Joueur ${i + 1}`,
          role: p.role || '',
          num: p.num || i + 1
        })),
        teamB: (positions.team2 || []).map((p: any, i: number) => ({
          x: p.x || this.defaultTeamB[i]?.x || 50,
          y: p.y || this.defaultTeamB[i]?.y || 50,
          name: p.name || `Joueur ${i + 1}`,
          role: p.role || '',
          num: p.num || i + 1
        }))
      };
    } else {
      this.viewPitchPlayers = {
        teamA: [...this.defaultTeamA],
        teamB: [...this.defaultTeamB]
      };
    }
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewData = null;
  }

  // ─── Statistics ───
  played(): number { return this.matches.filter(m => this.isFinished(m)).length; }
  totalGoals(): number { return this.matches.reduce((s, m) => s + (m.scoreA || 0) + (m.scoreB || 0), 0); }
  goalsPerMatch(): number { const p = this.played(); return p > 0 ? this.totalGoals() / p : 0; }
  avgPossession(): number {
    const w = this.matches.filter(m => m.possessionA); if (!w.length) return 50;
    return Math.round(w.reduce((s, m) => s + m.possessionA, 0) / w.length);
  }
  topTeam(): any { if (!this.classement.length) return null; return this.classement.reduce((t, c) => (c.goalsFor || 0) > (t.goalsFor || 0) ? c : t, this.classement[0]); }
  teamGoals(): any[] {
    if (!this.classement || this.classement.length === 0) return [];
    return this.classement
      .map(t => {
        // Robust check for different possible backend property names
        const goals = t.goalsFor ?? t.butsMarques ?? t.goals ?? 0;
        return { name: this.getTeamName(t), goals: goals };
      })
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 5);
  }
  maxGoals(): number {
    const d = this.teamGoals();
    if (!d || d.length === 0) return 1;
    return Math.max(...d.map(t => t.goals), 1);
  }

  analyzedCount(): number { return this.matches.filter(m => this.getMlStatus(m) === 'COMPLETED').length; }

  runCounters(): void {
    this._intervals.forEach(i => clearInterval(i)); this._intervals = [];
    this.countUp('goals', this.totalGoals(), 1000); this.countUp('played', this.played(), 700);
    this.countUp('planned', this.matches.length, 500); this.countUp('teams', this.classement.length, 400);
  }

  private countUp(k: string, target: number, dur: number): void {
    this.animCounters[k] = 0; if (!target) return;
    let c = 0; const inc = target / 20;
    const id = setInterval(() => { c += inc; if (c >= target) { this.animCounters[k] = target; clearInterval(id); } else this.animCounters[k] = Math.floor(c); }, dur / 20);
    this._intervals.push(id);
  }

  // ─── Bracket ───
  buildBracket(): void {
    if (!this.competition || this.competition.type === 'LEAGUE') return;
    
    const g: any = {};
    this.matches.forEach(m => { 
      const r = m.numeroJournee || 1; 
      (g[r] = g[r] || []).push(m); 
    });

    const rounds = Object.keys(g).map(Number).sort((a, b) => a - b);
    this.bracketLeft = [];
    this.bracketRight = [];
    this.bracketFinal = null;

    rounds.forEach((r, idx) => {
      const matches = g[r];
      if (idx === rounds.length - 1 && matches.length === 1) {
        this.bracketFinal = matches[0];
      } else {
        // Splitting matches into left and right for symmetry
        const mid = Math.ceil(matches.length / 2);
        this.bracketLeft.push({
          label: this.roundLabel(idx, rounds.length),
          matches: matches.slice(0, mid)
        });
        this.bracketRight.push({
          label: this.roundLabel(idx, rounds.length),
          matches: matches.slice(mid).reverse() // Reversed for right-side visual flow
        });
      }
    });

    // Ensure probability mock
    if (this.bracketFinal) {
      this.bracketFinal.winProbA = 52;
      this.bracketFinal.winProbB = 48;
    }
  }

  roundLabel(idx: number, total: number): string {
    const r = total - idx; if (r === 1) return 'Finale'; if (r === 2) return 'Demi-finales'; if (r === 3) return 'Quarts'; return `Tour ${idx + 1}`;
  }

  isWinner(m: any, s: 'A' | 'B'): boolean { return m?.status === 'FINISHED' && (s === 'A' ? m.scoreA > m.scoreB : m.scoreB > m.scoreA); }

  // ─── Calendrier Filters ───
  setCalendarFilter(f: 'yesterday' | 'today' | 'tomorrow' | 'all'): void {
    this.calendarFilter = f;
  }

  getFilteredMatches(): any[] {
    if (this.calendarFilter === 'all') return this.matches;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const matchDate = (m: any) => {
      const d = new Date(m.dateMatch);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    if (this.calendarFilter === 'yesterday') {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      return this.matches.filter(m => matchDate(m).getTime() === y.getTime());
    }
    if (this.calendarFilter === 'today') {
      return this.matches.filter(m => matchDate(m).getTime() === today.getTime());
    }
    if (this.calendarFilter === 'tomorrow') {
      const t = new Date(today); t.setDate(t.getDate() + 1);
      return this.matches.filter(m => matchDate(m).getTime() === t.getTime());
    }
    return this.matches;
  }

  matchCountForFilter(f: string): number {
    const prev = this.calendarFilter;
    this.calendarFilter = f as any;
    const count = this.getFilteredMatches().length;
    this.calendarFilter = prev;
    return count;
  }

  // ─── Countdown ───
  startCountdown(): void {
    if (this._countdownInterval) clearInterval(this._countdownInterval);
    this.updateCountdown();
    this._countdownInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown(): void {
    if (!this.competition?.startDate) { this.countdown = ''; return; }
    const start = new Date(this.competition.startDate).getTime();
    const now = Date.now();
    const diff = start - now;
    if (diff <= 0) { this.countdown = ''; if (this._countdownInterval) clearInterval(this._countdownInterval); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    this.countdown = `${d}j ${h}h ${m}m ${s}s`;
  }




  

  // ─── Position (Viewer Modal) ───
  onPlayerHover(p: any): void { this.hoveredPlayer = p; }
  onPlayerLeave(): void { this.hoveredPlayer = null; }

  // Stop event propagation for buttons inside match card
  stopPropagation(event: Event): void { event.stopPropagation(); }
}