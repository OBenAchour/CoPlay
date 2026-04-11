import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { NotificationService } from '../../../Core/Services/Notification/notification.service';
import { Subject } from 'rxjs';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let notificationService: NotificationService;
  let notificationSubject: Subject<any>;

  beforeEach(async () => {
    notificationSubject = new Subject();

    await TestBed.configureTestingModule({
      declarations: [ToastComponent],
      providers: [NotificationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);

    // Override the notifications$ to use our test subject
    (notificationService as any).notificationSubject = notificationSubject;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add notification when emitted', (done) => {
    const testNotification = {
      id: 123,
      type: 'success' as const,
      message: 'Test notification',
      duration: 3000
    };

    setTimeout(() => {
      expect(component.notifications.length).toBe(1);
      expect(component.notifications[0]).toEqual(testNotification);
      done();
    }, 100);

    notificationSubject.next(testNotification);
  });

  it('should remove notification by id', () => {
    const testNotification = {
      id: 123,
      type: 'success' as const,
      message: 'Test notification',
      duration: 3000
    };

    notificationSubject.next(testNotification);

    setTimeout(() => {
      component.removeNotification(123);
      expect(component.notifications.length).toBe(0);
    }, 100);
  });

  it('should return correct icon for each type', () => {
    expect(component.getIcon('success')).toBe('✓');
    expect(component.getIcon('error')).toBe('✕');
    expect(component.getIcon('warning')).toBe('⚠');
    expect(component.getIcon('info')).toBe('ℹ');
    expect(component.getIcon('unknown')).toBe('•');
  });

  it('should return correct class for each type', () => {
    expect(component.getClass('success')).toBe('toast-success');
    expect(component.getClass('error')).toBe('toast-error');
    expect(component.getClass('warning')).toBe('toast-warning');
    expect(component.getClass('info')).toBe('toast-info');
  });
});
