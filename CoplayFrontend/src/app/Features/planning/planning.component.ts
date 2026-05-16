import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CoachingService } from '../Coaching/services/coaching.service';
import { MarketplaceService } from '../Marketplace/services/marketplace.service';

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: 'SESSION' | 'BOOKING' | 'EVENT' | 'MATCH' | 'PROGRAM';
  color: string;
  link?: string;
  meta?: string;
}

@Component({
  selector: 'app-planning',
  template: `
    <div class="page">
      <div class="crumb-row">
        <div class="crumb">
          <a routerLink="/dashboard">CoPlay</a><span>›</span><span>Planning</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
          <div>
            <div class="eyebrow" style="margin-bottom:10px">Vue unifiée · Multi-modules</div>
            <h1 class="display" style="font-size:clamp(40px,5vw,72px);margin:0">Mon Planning</h1>
            <p style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">
              Sessions de coaching, réservations marketplace, matchs, événements et programmes — tout au même endroit.
            </p>
          </div>
          <div class="month-nav">
            <button class="btn-cp btn-ghost-cp btn-sm-cp" (click)="prevMonth()"><i class="bi bi-chevron-left"></i></button>
            <strong>{{ monthLabel }}</strong>
            <button class="btn-cp btn-ghost-cp btn-sm-cp" (click)="nextMonth()"><i class="bi bi-chevron-right"></i></button>
            <button class="btn-cp btn-primary-cp btn-sm-cp" (click)="today()">Aujourd'hui</button>
          </div>
        </div>
      </div>

      <!-- LÉGENDE -->
      <div class="legend">
        <span><span class="dot" style="background:#3b82f6"></span> Sessions coaching</span>
        <span><span class="dot" style="background:#8b5cf6"></span> Réservations marketplace</span>
        <span><span class="dot" style="background:#10b981"></span> Événements</span>
        <span><span class="dot" style="background:#f59e0b"></span> Matchs</span>
        <span><span class="dot" style="background:#ef4444"></span> Programmes</span>
      </div>

      <!-- STATS RAPIDES -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="num">{{ allEvents.length }}</div>
          <div class="lbl">Événements ce mois</div>
        </div>
        <div class="stat-card">
          <div class="num">{{ countByType('SESSION') }}</div>
          <div class="lbl">Sessions coaching</div>
        </div>
        <div class="stat-card">
          <div class="num">{{ countByType('BOOKING') }}</div>
          <div class="lbl">Réservations</div>
        </div>
        <div class="stat-card">
          <div class="num">{{ countByType('MATCH') + countByType('EVENT') }}</div>
          <div class="lbl">Matchs & événements</div>
        </div>
      </div>

      <!-- CALENDRIER MOIS -->
      <div class="calendar">
        <div class="cal-head">
          <div *ngFor="let d of weekDays">{{ d }}</div>
        </div>
        <div class="cal-body">
          <div *ngFor="let day of monthDays"
               class="cal-cell"
               [class.other-month]="!day.inMonth"
               [class.today]="day.isToday"
               [class.has-events]="day.events.length > 0">
            <div class="cell-num">{{ day.date.getDate() }}</div>
            <div class="cell-events">
              <a *ngFor="let e of day.events.slice(0,3)"
                 class="cell-evt"
                 [style.background]="e.color"
                 [routerLink]="e.link"
                 [title]="e.title">
                {{ e.title | slice:0:24 }}
              </a>
              <span *ngIf="day.events.length > 3" class="cell-more">
                +{{ day.events.length - 3 }} autres
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- AGENDA TEXTUEL : Prochains 10 -->
      <section class="agenda">
        <h2><i class="bi bi-list-task"></i> Prochains événements</h2>
        <div *ngIf="upcoming.length === 0" class="cp-empty">
          <i class="bi bi-calendar-x"></i>
          <p>Aucun événement à venir. Génère un programme avec le Coach IA ou réserve une prestation.</p>
          <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
            <button class="btn-cp btn-primary-cp btn-sm-cp" routerLink="/coaching/ai">Coach IA</button>
            <button class="btn-cp btn-ghost-cp btn-sm-cp" routerLink="/marketplace">Marketplace</button>
          </div>
        </div>
        <ul class="agenda-list">
          <li *ngFor="let e of upcoming">
            <span class="agenda-dot" [style.background]="e.color"></span>
            <span class="agenda-date">{{ e.date | date:'EEE dd MMM' }}</span>
            <a [routerLink]="e.link" class="agenda-title">{{ e.title }}</a>
            <span class="agenda-type">{{ typeLabel(e.type) }}</span>
            <span class="agenda-meta" *ngIf="e.meta">{{ e.meta }}</span>
          </li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .page { max-width: 1280px; margin: 0 auto; padding: 24px; }
    .crumb-row { margin-bottom: 24px; }
    .crumb { display: flex; gap: 6px; align-items: center; font-size: 13px; color: var(--muted); }
    .crumb a { color: var(--accent); text-decoration: none; }

    .month-nav { display: flex; align-items: center; gap: 10px; }
    .month-nav strong { font-size: 18px; min-width: 160px; text-align: center; text-transform: capitalize; }

    .legend {
      display: flex; gap: 18px; flex-wrap: wrap;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 12px;
      margin-bottom: 18px;
      font-size: 12px;
      color: var(--muted);
    }
    .legend .dot {
      display: inline-block; width: 10px; height: 10px;
      border-radius: 50%; margin-right: 4px; vertical-align: middle;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin-bottom: 24px;
    }
    .stat-card {
      padding: 18px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
    }
    .stat-card .num { font-size: 30px; font-weight: 700; color: var(--accent); }
    .stat-card .lbl { font-size: 12px; color: var(--muted); margin-top: 4px; }

    .calendar { background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
    .cal-head {
      display: grid; grid-template-columns: repeat(7, 1fr);
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .cal-head div {
      padding: 10px; font-size: 12px; font-weight: 600;
      color: var(--muted); text-align: center; text-transform: uppercase;
      letter-spacing: .08em;
    }
    .cal-body {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-auto-rows: minmax(110px, 1fr);
    }
    .cal-cell {
      border-right: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      padding: 6px;
      position: relative;
      min-height: 100px;
    }
    .cal-cell.other-month { background: #fafbfc; color: #cbd5e1; }
    .cal-cell.today { background: #fef3c7; }
    .cal-cell.today .cell-num {
      background: #f59e0b; color: white;
      border-radius: 50%; width: 24px; height: 24px;
      display: grid; place-items: center; font-weight: 700;
    }
    .cell-num { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px; }
    .cell-events { display: flex; flex-direction: column; gap: 2px; }
    .cell-evt {
      display: block;
      padding: 2px 6px;
      border-radius: 4px;
      color: white;
      font-size: 10px;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cell-evt:hover { opacity: .85; }
    .cell-more { font-size: 10px; color: var(--muted); padding: 1px 6px; }

    .agenda { margin-top: 32px; }
    .agenda h2 { font-size: 22px; display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    .agenda-list { list-style: none; padding: 0; margin: 0; }
    .agenda-list li {
      display: grid;
      grid-template-columns: 14px 100px 1fr auto auto;
      gap: 12px;
      align-items: center;
      padding: 12px 14px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      margin-bottom: 6px;
    }
    .agenda-dot { width: 10px; height: 10px; border-radius: 50%; }
    .agenda-date { font-size: 12px; color: var(--muted); font-family: var(--font-mono); text-transform: capitalize; }
    .agenda-title { text-decoration: none; color: #0f172a; font-weight: 600; }
    .agenda-type { background: #f1f5f9; padding: 3px 8px; border-radius: 999px; font-size: 11px; color: var(--muted); }
    .agenda-meta { font-size: 11px; color: var(--muted); }

    .cp-empty { padding: 40px; text-align: center; color: var(--muted); }
    .cp-empty i { font-size: 36px; display: block; margin-bottom: 8px; }
  `],
})
export class PlanningComponent implements OnInit {
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  cursor = new Date();
  monthDays: { date: Date; inMonth: boolean; isToday: boolean; events: CalendarEvent[] }[] = [];
  allEvents: CalendarEvent[] = [];
  upcoming: CalendarEvent[] = [];
  monthLabel = '';

  constructor(
    private cs: CoachingService,
    private mp: MarketplaceService,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    forkJoin({
      programs: this.cs.programsAsClient().pipe(catchError(() => of([] as any[]))),
      bookings: this.mp.myBookings().pipe(catchError(() => of({ content: [] } as any))),
      events: this.http.get<any[]>('http://localhost:8080/api/events/all').pipe(catchError(() => of([] as any[]))),
    }).subscribe(({ programs, bookings, events }) => {
      this.allEvents = [];

      // 1) Programmes → on génère N jours d'entraînement à partir de createdAt
      (programs || []).forEach((p: any) => {
        const start = new Date(p.createdAt || p.startDate || Date.now());
        const weeks = p.durationWeeks || 4;
        for (let w = 0; w < weeks; w++) {
          for (let d = 0; d < 3; d++) {
            const eventDate = new Date(start);
            eventDate.setDate(eventDate.getDate() + w * 7 + d * 2);
            this.allEvents.push({
              id: `prog-${p.programId}-${w}-${d}`,
              date: eventDate,
              title: `📋 ${p.title || 'Programme'} · S${w + 1}J${d + 1}`,
              type: 'PROGRAM',
              color: '#ef4444',
              link: '/coaching/programs',
            });
          }
        }
      });

      // 2) Bookings marketplace
      const bookingsList = bookings.content || bookings || [];
      bookingsList.forEach((b: any) => {
        const d = new Date(b.scheduledAt || b.startDate || b.createdAt);
        this.allEvents.push({
          id: `book-${b.bookingId || b.id}`,
          date: d,
          title: `🎯 ${b.targetType === 'SERVICE' ? 'Prestation' : 'Coaching'} · ${b.title || 'Réservation'}`,
          type: 'BOOKING',
          color: '#8b5cf6',
          link: '/marketplace/orders',
          meta: b.status,
        });
      });

      // 3) Events
      (events || []).forEach((e: any) => {
        const d = new Date(e.dateTime || e.startDate || e.createdAt);
        this.allEvents.push({
          id: `evt-${e.eventId || e.id}`,
          date: d,
          title: `📅 ${e.title || e.name || 'Événement'}`,
          type: 'EVENT',
          color: '#10b981',
          link: `/events/${e.eventId || e.id}`,
          meta: e.location,
        });
      });

      this.buildMonth();
      this.computeUpcoming();
    });
  }

  buildMonth() {
    const y = this.cursor.getFullYear();
    const m = this.cursor.getMonth();
    this.monthLabel = this.cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const first = new Date(y, m, 1);
    const lastDayOffset = (first.getDay() + 6) % 7; // 0 = Monday
    const start = new Date(y, m, 1 - lastDayOffset);

    const todayKey = new Date().toDateString();
    const days: typeof this.monthDays = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({
        date: d,
        inMonth: d.getMonth() === m,
        isToday: d.toDateString() === todayKey,
        events: this.allEvents.filter(e => sameDay(e.date, d)),
      });
    }
    this.monthDays = days;
  }

  computeUpcoming() {
    const now = Date.now();
    this.upcoming = this.allEvents
      .filter(e => e.date.getTime() >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 10);
  }

  countByType(t: CalendarEvent['type']): number {
    const y = this.cursor.getFullYear();
    const m = this.cursor.getMonth();
    return this.allEvents.filter(e =>
      e.type === t && e.date.getFullYear() === y && e.date.getMonth() === m
    ).length;
  }

  prevMonth() { this.cursor = new Date(this.cursor.getFullYear(), this.cursor.getMonth() - 1, 1); this.buildMonth(); }
  nextMonth() { this.cursor = new Date(this.cursor.getFullYear(), this.cursor.getMonth() + 1, 1); this.buildMonth(); }
  today() { this.cursor = new Date(); this.buildMonth(); }

  typeLabel(t: CalendarEvent['type']): string {
    return ({ SESSION: 'Session', BOOKING: 'Marketplace', EVENT: 'Événement', MATCH: 'Match', PROGRAM: 'Programme' } as const)[t];
  }
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}
