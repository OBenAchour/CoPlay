import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallWindowComponent } from './call-window.component';

describe('CallWindowComponent', () => {
  let component: CallWindowComponent;
  let fixture: ComponentFixture<CallWindowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CallWindowComponent]
    });
    fixture = TestBed.createComponent(CallWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
