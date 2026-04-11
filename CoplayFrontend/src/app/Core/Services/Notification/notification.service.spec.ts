import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit success notification with id', (done) => {
    service.notifications$.subscribe(notification => {
      expect(notification.type).toBe('success');
      expect(notification.message).toBe('Test success');
      expect(notification.id).toBeDefined();
      expect(typeof notification.id).toBe('number');
      done();
    });

    service.success('Test success');
  });

  it('should emit error notification with id', (done) => {
    service.notifications$.subscribe(notification => {
      expect(notification.type).toBe('error');
      expect(notification.message).toBe('Test error');
      expect(notification.id).toBeDefined();
      done();
    });

    service.error('Test error');
  });

  it('should generate unique ids for notifications', (done) => {
    const ids: number[] = [];
    let count = 0;

    service.notifications$.subscribe(notification => {
      ids.push(notification.id);
      count++;

      if (count === 2) {
        expect(ids[0]).not.toBe(ids[1]);
        done();
      }
    });

    service.success('First');
    service.error('Second');
  });
});
