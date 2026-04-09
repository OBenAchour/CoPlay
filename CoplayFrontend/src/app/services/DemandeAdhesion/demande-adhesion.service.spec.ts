import { TestBed } from '@angular/core/testing';

import { DemandeAdhesionService } from './demande-adhesion.service';

describe('DemandeAdhesionService', () => {
  let service: DemandeAdhesionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandeAdhesionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
