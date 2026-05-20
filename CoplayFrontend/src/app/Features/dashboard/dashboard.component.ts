import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService }       from '../../Core/Services/Auth/auth.service';
import { MatchStatus }       from '../../Core/Models/Competitions/MatchStatus';
import { MatchService }      from '../Competitions/services/match.service';
import { EventService }      from '../../Core/Services/Events & Training/EventService/event-service.service';
import { CompetitionService } from '../Competitions/services/competition.service';
import { PostService }       from '../../Core/Services/Social/post.service';
import { MatchCompetition }  from '../../Core/Models/Competitions/MatchCompetition';
import { CoplayEvent }       from '../../Core/Models/Events & Training/CoplayEvent';
import { Competition }       from '../../Core/Models/Competitions/Competition';
import { Post }              from '../../Core/Models/Social/Post';

interface Tilt { rx: number; ry: number; mx: number; my: number; }
interface StatCard { icon: string; label: string; value: string; sub: string; accent: string; }

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private rafId = 0;

  userName = '';
  isAdmin  = false;
  loading  = true;

  tilts: Record<string, Tilt> = {};

  // ── Stats (valeurs chargées depuis l'API)
  stats: StatCard[] = [
    { icon: 'ball',     label: 'Matchs',       value: '—', sub: 'total',       accent: '#0AADE3' },
    { icon: 'trophy',   label: 'Compétitions', value: '—', sub: 'actives',     accent: '#F47920' },
    { icon: 'calendar', label: 'Événements',   value: '—', sub: 'à venir',     accent: '#EF4444' },
    { icon: 'feed',     label: 'Publications', value: '—', sub: 'dans le feed', accent: '#16A34A' },
  ];

  // ── Données API
  upcomingMatch:    MatchCompetition | null = null;
  upcomingEvents:   CoplayEvent[]           = [];
  recentPosts:      Post[]                  = [];
  competitions:     Competition[]           = [];

  // ── Orbite 3D (angles fixes, animation gérée hors zone)
  readonly orbitCards = [
    { icon: 'trophy', label: 'Matchs', baseAngle: 0,   color: '#F47920' },
    { icon: 'flame',  label: '5j',     baseAngle: 120, color: '#EF4444' },
    { icon: 'spark',  label: 'XP',     baseAngle: 240, color: '#0AADE3' },
  ];

  // ── Niveau (calculé depuis l'activité réelle)
  readonly levelRadius = 52;
  xpTotal    = 0;
  xpPerLevel = 500; // XP nécessaire par niveau

  get currentLevel()  { return Math.floor(this.xpTotal / this.xpPerLevel) + 1; }
  get xpInLevel()     { return this.xpTotal % this.xpPerLevel; }
  get levelPercent()  { return Math.round((this.xpInLevel / this.xpPerLevel) * 100); }
  get levelCirc()     { return 2 * Math.PI * this.levelRadius; }
  get levelOffset()   { return this.levelCirc * (1 - this.xpInLevel / this.xpPerLevel); }
  get levelName(): string {
    const lvl = this.currentLevel;
    if (lvl <= 2) return 'Recrue';
    if (lvl <= 4) return 'Amateur';
    if (lvl <= 6) return 'Semi-Pro';
    if (lvl <= 8) return 'Pro';
    return 'Légende';
  }

  constructor(
    private zone:        NgZone,
    private sanitizer:   DomSanitizer,
    private auth:        AuthService,
    private matchSvc:    MatchService,
    private eventSvc:    EventService,
    private compSvc:     CompetitionService,
    private postSvc:     PostService
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserName() || '';
    this.isAdmin  = this.auth.isAdmin();

    ['hero', 'match', 'level', 's0', 's1', 's2', 's3'].forEach(k => {
      this.tilts[k] = { rx: 0, ry: 0, mx: 50, my: 50 };
    });

    this.loadData();
    this.startScene();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  // ── Chargement API ───────────────────────────────────────────────
  private loadData(): void {
    forkJoin({
      matches:      this.matchSvc.getAllMatches().pipe(catchError(() => of([]))),
      events:       this.eventSvc.getAllEvents().pipe(catchError(() => of([]))),
      competitions: this.compSvc.getAllCompetitions().pipe(catchError(() => of([]))),
      posts:        this.postSvc.getAllPosts().pipe(catchError(() => of([]))),
    }).subscribe(({ matches, events, competitions, posts }) => {

      // Stats
      const upcoming = events.filter((e: CoplayEvent) => e.status === 'SCHEDULED');
      this.stats[0].value = String(matches.length);
      this.stats[1].value = String(competitions.length);
      this.stats[2].value = String(upcoming.length);
      this.stats[3].value = String(posts.length);

      // Calcul XP basé sur l'activité réelle
      this.xpTotal =
        matches.length      * 50  +   // 50 XP par match
        competitions.length * 100 +   // 100 XP par compétition
        events.length       * 30  +   // 30 XP par événement
        posts.length        * 10;     // 10 XP par publication

      // Prochain match (premier non joué/annulé)
      const done = [MatchStatus.FINISHED, MatchStatus.COMPLETED, MatchStatus.CANCELLED];
      const pending = (matches as MatchCompetition[]).filter(
        m => !m.status || !done.includes(m.status)
      );
      this.upcomingMatch = pending.length > 0 ? pending[0] : null;

      // Événements à venir (3 premiers)
      this.upcomingEvents = upcoming
        .sort((a: CoplayEvent, b: CoplayEvent) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
        .slice(0, 3);

      // Compétitions actives
      this.competitions = (competitions as Competition[]).slice(0, 3);

      // Posts récents (3 premiers)
      this.recentPosts = (posts as Post[]).slice(0, 3);

      this.loading = false;
    });
  }

  // ── Animation 3D (hors Angular zone) ────────────────────────────
  private startScene(): void {
    this.zone.runOutsideAngular(() => {
      let t = 0;
      const tick = () => {
        t++;
        const time = t * 0.012;
        const rotY  = Math.sin(time) * 14;
        const rotX  = Math.cos(time * 0.8) * 6;

        const ring = document.getElementById('db-ring');
        if (ring) ring.style.transform = `rotateX(${65 + rotX}deg) rotateZ(${rotY}deg)`;

        this.orbitCards.forEach((card, i) => {
          const ang = (card.baseAngle + t * 0.6) * Math.PI / 180;
          const x = Math.cos(ang) * 90;
          const y = Math.sin(ang) * 38;
          const z = Math.sin(ang) * 30;
          const el = document.getElementById(`db-orbit-${i}`);
          if (el) el.style.transform =
            `translate(-50%,-50%) translate(${x}px,${y}px) translateZ(${z}px) rotateY(${rotY * 0.5}deg)`;
        });

        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }

  // ── Tilt ────────────────────────────────────────────────────────
  onTiltMove(e: MouseEvent, key: string, intensity = 8): void {
    const el = e.currentTarget as HTMLElement;
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width;
    const y  = (e.clientY - r.top)  / r.height;
    if (this.tilts[key]) {
      this.tilts[key].rx = (y - 0.5) * -intensity;
      this.tilts[key].ry = (x - 0.5) *  intensity;
      this.tilts[key].mx = x * 100;
      this.tilts[key].my = y * 100;
    }
  }

  onTiltLeave(key: string): void {
    if (this.tilts[key]) this.tilts[key] = { rx: 0, ry: 0, mx: 50, my: 50 };
  }

  tiltTransform(key: string): string {
    const t = this.tilts[key];
    return t ? `perspective(1000px) rotateX(${t.rx}deg) rotateY(${t.ry}deg)` : '';
  }

  glowBg(key: string): string {
    const t = this.tilts[key];
    if (!t || (t.rx === 0 && t.ry === 0)) return '';
    return `radial-gradient(circle at ${t.mx}% ${t.my}%, rgba(255,255,255,.35), transparent 50%)`;
  }

  glowOpacity(key: string): number {
    const t = this.tilts[key];
    return t && (t.rx !== 0 || t.ry !== 0) ? 1 : 0;
  }

  // ── Helpers affichage ───────────────────────────────────────────
  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  getMatchScore(m: MatchCompetition): string {
    if (m.status === MatchStatus.FINISHED || m.status === MatchStatus.COMPLETED) {
      return `${m.scoreA ?? 0} · ${m.scoreB ?? 0}`;
    }
    return '? · ?';
  }

  teamInitial(name?: string): string {
    return (name || '?').substring(0, 2).toUpperCase();
  }

  postAuthor(p: Post): string {
    return p.author?.profile?.displayName || '?';
  }

  postInitial(p: Post): string {
    return this.postAuthor(p).charAt(0).toUpperCase();
  }

  getAvatarColor(id?: string): string {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#a18cd1'];
    if (!id) return colors[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  getRelativeTime(dateStr?: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'À l\'instant';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    if (h < 24)    return `${h}h`;
    return `${Math.floor(h / 24)}j`;
  }

  getEventStatusColor(status?: string): string {
    switch (status) {
      case 'SCHEDULED': return '#0AADE3';
      case 'ONGOING':   return '#22C55E';
      case 'COMPLETED': return '#9A8F7F';
      case 'CANCELLED': return '#EF4444';
      default:          return '#9A8F7F';
    }
  }

  // ── Icônes ──────────────────────────────────────────────────────
  icon(name: string, size = 18): SafeHtml {
    const sw = 1.6;
    const a  = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
    const map: Record<string, string> = {
      ball:     `<svg ${a}><circle cx="12" cy="12" r="9"/><path d="M12 3l4 5-2 6-5 1-3-4 2-6z"/><path d="M12 3v3M21 12l-3 .5M5 9l-2 3M9 20l1-3M18 17l-2-2"/></svg>`,
      trophy:   `<svg ${a}><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3"/><path d="M10 14h4l-.5 4h-3z"/><path d="M8 20h8"/></svg>`,
      flame:    `<svg ${a}><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 2 2 1-1-3 0-5 1-7z"/></svg>`,
      spark:    `<svg ${a}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/></svg>`,
      arrow:    `<svg ${a}><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
      calendar: `<svg ${a}><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>`,
      feed:     `<svg ${a}><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.4"/></svg>`,
      chart:    `<svg ${a}><path d="M4 19h16"/><path d="M7 19V11M12 19V6M17 19v-5"/></svg>`,
      user:     `<svg ${a}><circle cx="12" cy="8" r="3.6"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>`,
    };
    return this.sanitizer.bypassSecurityTrustHtml(map[name] ?? '');
  }
}
