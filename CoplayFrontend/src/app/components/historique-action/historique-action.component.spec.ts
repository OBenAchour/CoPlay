import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueActionComponent } from './historique-action.component';

describe('HistoriqueActionComponent', () => {
  let component: HistoriqueActionComponent;
  let fixture: ComponentFixture<HistoriqueActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistoriqueActionComponent]
    });
    fixture = TestBed.createComponent(HistoriqueActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
