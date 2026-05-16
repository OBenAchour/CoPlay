import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingProgramFormComponent } from './training-program-form.component';

describe('TrainingProgramFormComponent', () => {
  let component: TrainingProgramFormComponent;
  let fixture: ComponentFixture<TrainingProgramFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingProgramFormComponent]
    });
    fixture = TestBed.createComponent(TrainingProgramFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
