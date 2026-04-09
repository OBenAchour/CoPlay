import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeAdhesionComponent } from './demande-adhesion.component';

describe('DemandeAdhesionComponent', () => {
  let component: DemandeAdhesionComponent;
  let fixture: ComponentFixture<DemandeAdhesionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DemandeAdhesionComponent]
    });
    fixture = TestBed.createComponent(DemandeAdhesionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
