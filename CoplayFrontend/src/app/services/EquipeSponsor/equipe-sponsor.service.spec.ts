import { TestBed } from '@angular/core/testing';

import { EquipeSponsorService } from './equipe-sponsor.service';

describe('EquipeSponsorService', () => {
  let service: EquipeSponsorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EquipeSponsorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
