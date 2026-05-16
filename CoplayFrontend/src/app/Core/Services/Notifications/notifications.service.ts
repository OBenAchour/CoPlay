import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client } from '@stomp/stompjs';

export interface AppNotification {
  id: string;
  type: 'INJURY_RISK' | 'BOOKING' | 'ORDER_STATUS' | 'ORDER_PAID' | 'SESSION_REMINDER' | 'MESSAGE' | 'SYSTEM';
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  icon: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService implements OnDestroy {
  private stomp: Client | null = null;
  private state = new BehaviorSubject<AppNotification[]>([]);
  private connected = false;

  /** Observable list of notifications, latest first. */
  list$(): Observable<AppNotification[]> { return this.state.asObservable(); }

  /** Connect STOMP and subscribe to user queues. Call after login. */
  connect(userId: string) {
    if (this.connected || !userId) return;
    this.connected = true;

    // Seed a couple of demo notifications so the bell is visible immediately.
    this.seedDemoIfEmpty();

    try {
      const c = new Client({
        webSocketFactory: () => new WebSocket('http://localhost:8080/ws-call'),
        onConnect: () => {
          this.subscribe(c, `/queue/user-${userId}/coaching`, payload => {
            this.push({
              type: payload.type || 'INJURY_RISK',
              title: '🩹 Alerte coaching',
              body: payload.label
                ? `Risque détecté : ${payload.label}`
                : 'Nouvelle info coaching',
              link: '/coaching',
              icon: 'bi-bandaid',
              color: '#ef4444',
            });
          });
          this.subscribe(c, `/queue/user-${userId}/marketplace`, payload => {
            const isPaid = payload.type === 'ORDER_PAID';
            this.push({
              type: payload.type || 'BOOKING',
              title: isPaid ? '💰 Commande payée' : '🛒 Mise à jour commande',
              body: payload.orderId
                ? `Commande #${String(payload.orderId).slice(-6)} : ${payload.status || 'mise à jour'}`
                : payload.bookingId
                  ? `Réservation #${String(payload.bookingId).slice(-6)}`
                  : 'Activité marketplace',
              link: '/marketplace/orders',
              icon: 'bi-bag-check',
              color: isPaid ? '#22c55e' : '#3b82f6',
            });
          });
        },
        onStompError: () => { this.connected = false; },
        onWebSocketClose: () => { this.connected = false; },
      });
      c.activate();
      this.stomp = c;
    } catch {
      // STOMP unavailable: keep demo notifications only.
    }
  }

  private subscribe(c: Client, topic: string, cb: (payload: any) => void) {
    c.subscribe(topic, msg => {
      try { cb(JSON.parse(msg.body)); } catch { cb({}); }
    });
  }

  push(partial: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) {
    const n: AppNotification = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      read: false,
      createdAt: new Date(),
      ...partial,
    };
    this.state.next([n, ...this.state.value].slice(0, 50));
  }

  markAsRead(id: string) {
    this.state.next(this.state.value.map(n => n.id === id ? { ...n, read: true } : n));
  }

  markAllRead() {
    this.state.next(this.state.value.map(n => ({ ...n, read: true })));
  }

  unreadCount(): number {
    return this.state.value.filter(n => !n.read).length;
  }

  clear() {
    this.state.next([]);
  }

  /** Inject 2 sample notifications so the widget is visible even without backend events. */
  private seedDemoIfEmpty() {
    if (this.state.value.length > 0) return;
    this.push({
      type: 'SESSION_REMINDER',
      title: '👋 Bienvenue',
      body: 'Tes notifications coaching et marketplace apparaîtront ici en temps réel.',
      icon: 'bi-bell',
      color: '#0ea5e9',
    });
  }

  disconnect() {
    this.stomp?.deactivate();
    this.stomp = null;
    this.connected = false;
  }

  ngOnDestroy() { this.disconnect(); }
}
