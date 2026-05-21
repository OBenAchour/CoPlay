import { TestBed } from '@angular/core/testing';
import { TicketShopComponent } from './ticket-shop.component';

describe('TicketShopComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TicketShopComponent],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TicketShopComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
