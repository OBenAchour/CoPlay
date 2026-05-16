import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketShopComponent } from './ticket-shop.component';

describe('TicketShopComponent', () => {
  let component: TicketShopComponent;
  let fixture: ComponentFixture<TicketShopComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicketShopComponent]
    });
    fixture = TestBed.createComponent(TicketShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
