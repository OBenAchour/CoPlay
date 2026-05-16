import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingProgramListComponent } from './training-program-list.component';

describe('TrainingProgramListComponent', () => {
  let component: TrainingProgramListComponent;
  let fixture: ComponentFixture<TrainingProgramListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingProgramListComponent]
    });
    fixture = TestBed.createComponent(TrainingProgramListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
