import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingProgramDetailComponent } from './training-program-detail.component';

describe('TrainingProgramDetailComponent', () => {
  let component: TrainingProgramDetailComponent;
  let fixture: ComponentFixture<TrainingProgramDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingProgramDetailComponent]
    });
    fixture = TestBed.createComponent(TrainingProgramDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
