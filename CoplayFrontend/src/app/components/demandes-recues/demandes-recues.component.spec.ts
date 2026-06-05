import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesRecuesComponent } from './demandes-recues.component';

describe('DemandesRecuesComponent', () => {
  let component: DemandesRecuesComponent;
  let fixture: ComponentFixture<DemandesRecuesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DemandesRecuesComponent]
    });
    fixture = TestBed.createComponent(DemandesRecuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
