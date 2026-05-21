import { TestBed } from '@angular/core/testing';
import { MyTicketsComponent } from './my-tickets.component';

describe('MyTicketsComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyTicketsComponent],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MyTicketsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
