import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService, AppNotification } from '../../../Core/Services/Notifications/notifications.service';
import { AuthService } from '../../../Core/Services/Auth/auth.service';

@Component({
  selector: 'app-notifications-bell',
  template: `
    <div class="bell-wrap" *ngIf="authService.isLoggedIn()">
      <button class="bell-btn" (click)="toggle($event)" [class.has-unread]="unread > 0" aria-label="Notifications">
        <i class="bi bi-bell-fill"></i>
        <span class="bell-badge" *ngIf="unread > 0">{{ unread > 9 ? '9+' : unread }}</span>
      </button>

      <div class="bell-dropdown" *ngIf="open" (click)="$event.stopPropagation()">
        <header class="bell-header">
          <strong>Notifications</strong>
          <button class="link" (click)="markAll()" *ngIf="unread > 0">Tout marquer lu</button>
        </header>

        <ul class="bell-list" *ngIf="items.length > 0">
          <li *ngFor="let n of items" [class.unread]="!n.read" (click)="openItem(n)">
            <span class="dot" [style.background]="n.color"><i class="bi" [class]="n.icon"></i></span>
            <div class="body">
              <div class="title">{{ n.title }}</div>
              <div class="desc">{{ n.body }}</div>
              <div class="time">{{ relativeTime(n.createdAt) }}</div>
            </div>
            <span class="unread-dot" *ngIf="!n.read"></span>
          </li>
        </ul>

        <div class="empty" *ngIf="items.length === 0">
          <i class="bi bi-inbox"></i>
          <p>Aucune notification.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bell-wrap { position: relative; }
    .bell-btn {
      position: relative;
      width: 38px; height: 38px;
      border: none;
      background: rgba(255,255,255,.08);
      color: white;
      border-radius: 50%;
      cursor: pointer;
      display: grid; place-items: center;
      font-size: 16px;
      transition: background .15s;
    }
    .bell-btn:hover { background: rgba(255,255,255,.16); }
    .bell-btn.has-unread { color: #fbbf24; }
    .bell-badge {
      position: absolute;
      top: -2px; right: -2px;
      background: #ef4444;
      color: white;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 5px;
      min-width: 18px;
      text-align: center;
      border: 2px solid #0E1A2B;
    }
    .bell-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 360px;
      max-height: 480px;
      background: white;
      color: #0E1A2B;
      border-radius: 14px;
      box-shadow: 0 14px 40px rgba(0,0,0,.25);
      border: 1px solid rgba(0,0,0,.08);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: drop .15s ease-out;
    }
    @keyframes drop {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .bell-header {
      padding: 14px 16px;
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid #f1f5f9;
    }
    .bell-header strong { font-size: 14px; }
    .bell-header .link {
      background: transparent;
      border: none;
      color: #2563eb;
      cursor: pointer;
      font-size: 12px;
    }
    .bell-list {
      list-style: none;
      margin: 0;
      padding: 4px 0;
      overflow-y: auto;
      flex: 1;
    }
    .bell-list li {
      display: grid;
      grid-template-columns: 36px 1fr 8px;
      gap: 10px;
      align-items: flex-start;
      padding: 10px 14px;
      cursor: pointer;
      transition: background .12s;
    }
    .bell-list li:hover { background: #f8fafc; }
    .bell-list li.unread { background: #eff6ff; }
    .bell-list li.unread:hover { background: #dbeafe; }
    .dot {
      width: 32px; height: 32px;
      border-radius: 50%;
      display: grid; place-items: center;
      color: white;
      font-size: 14px;
    }
    .body .title { font-size: 13px; font-weight: 600; color: #0f172a; }
    .body .desc  { font-size: 12px; color: #475569; margin-top: 2px; line-height: 1.35; }
    .body .time  { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    .unread-dot {
      width: 8px; height: 8px;
      background: #2563eb;
      border-radius: 50%;
      margin-top: 14px;
    }
    .empty {
      padding: 36px 20px;
      text-align: center;
      color: #94a3b8;
    }
    .empty i { font-size: 32px; display: block; margin-bottom: 8px; }
  `],
})
export class NotificationsBellComponent implements OnInit {
  open = false;
  items: AppNotification[] = [];
  unread = 0;

  constructor(
    private notifs: NotificationsService,
    public authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    const userId = localStorage.getItem('userId') || this.authService.getUserId?.() || '';
    if (userId) this.notifs.connect(userId);
    this.notifs.list$().subscribe(list => {
      this.items = list;
      this.unread = list.filter(n => !n.read).length;
    });
  }

  toggle(ev: MouseEvent) {
    ev.stopPropagation();
    this.open = !this.open;
  }

  @HostListener('document:click')
  onDocClick() { this.open = false; }

  markAll() { this.notifs.markAllRead(); }

  openItem(n: AppNotification) {
    this.notifs.markAsRead(n.id);
    this.open = false;
    if (n.link) this.router.navigate([n.link]);
  }

  relativeTime(d: Date): string {
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 60) return 'à l’instant';
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + ' h';
    return Math.floor(diff / 86400) + ' j';
  }
}
