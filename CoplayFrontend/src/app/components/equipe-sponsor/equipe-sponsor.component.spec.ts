import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipeSponsorComponent } from './equipe-sponsor.component';

describe('EquipeSponsorComponent', () => {
  let component: EquipeSponsorComponent;
  let fixture: ComponentFixture<EquipeSponsorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EquipeSponsorComponent]
    });
    fixture = TestBed.createComponent(EquipeSponsorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
