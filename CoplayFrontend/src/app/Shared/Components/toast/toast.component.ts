import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService, Notification } from '../../../Core/Services/Notification/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(notification => {
      this.addNotification(notification);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private addNotification(notification: Notification) {
    this.notifications.push(notification);

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, notification.duration || 3000);
  }

  removeNotification(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  }

  getClass(type: string): string {
    return `toast-${type}`;
  }
}
