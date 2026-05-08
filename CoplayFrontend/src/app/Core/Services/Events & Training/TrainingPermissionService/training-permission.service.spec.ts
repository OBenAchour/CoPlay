import { TestBed } from '@angular/core/testing';

import { TrainingPermissionService } from './training-permission.service';

describe('TrainingPermissionService', () => {
  let service: TrainingPermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingPermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
