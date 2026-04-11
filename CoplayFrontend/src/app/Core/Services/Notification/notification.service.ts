import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  public notifications$ = this.notificationSubject.asObservable();

  success(message: string, duration = 3000) {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000) {
    this.show({ type: 'error', message, duration });
  }

  warning(message: string, duration = 4000) {
    this.show({ type: 'warning', message, duration });
  }

  info(message: string, duration = 3000) {
    this.show({ type: 'info', message, duration });
  }

  private show(notification: Omit<Notification, 'id'>) {
    const notificationWithId: Notification = {
      ...notification,
      id: Date.now()
    };
    this.notificationSubject.next(notificationWithId);
  }
}
