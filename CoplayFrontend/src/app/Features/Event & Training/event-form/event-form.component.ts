import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

import { CoplayEvent } from 'src/app/Core/Models/Events & Training/CoplayEvent';
import { EventLocation } from 'src/app/Core/Models/Events & Training/EventLocation';
import { Team } from 'src/app/Core/Models/Teams/Team';
import { EventService } from 'src/app/Core/Services/Events & Training/EventService/event-service.service';
import { LocationService } from 'src/app/Core/Services/Events & Training/LocationService/location-service.service';
import { TeamService } from 'src/app/services/Team/team.service';
import { MapLocation } from 'src/app/Features/Event & Training/map/map.component';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  eventId = '';
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // Recherche de lieu
  locationQuery = '';
  isSearchingLocation = false;
  locationError = '';
  selectedLocation: EventLocation | null = null;

  // ✅ Carte
  showMap = false;
  tempLocation: MapLocation | null = null;  // ✅ NOUVEAU : Lieu temporaire avant confirmation

  // Teams
  teams: Team[] = [];
  selectedTeamId: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private locationService: LocationService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadTeams();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.eventId = id;
      this.loadEventForEdit(id);
    }

    this.form.get('isPaid')!.valueChanges.subscribe((isPaid: boolean) => {
      const fee = this.form.get('registrationFee')!;
      const deadline = this.form.get('paymentDeadlineHours')!;
      if (isPaid) {
        fee.setValidators([Validators.required, Validators.min(0.1)]);
        deadline.setValidators([Validators.required, Validators.min(1)]);
      } else {
        fee.clearValidators();
        deadline.clearValidators();
      }
      fee.updateValueAndValidity();
      deadline.updateValueAndValidity();
    });
  }

  private loadTeams(): void {
    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        if (teams.length > 0 && !this.selectedTeamId) {
          this.selectedTeamId = teams[0].teamId || '';
        }
      },
      error: (err) => {
        console.log('Erreur chargement teams:', err);
      }
    });
  }

  private buildForm(): void {
    this.form = this.fb.group(
      {
        title: ['', [Validators.required, Validators.minLength(3)]],
        startDate: ['', Validators.required],
        endDate: [''],
        maxParticipants: [null, [Validators.min(2)]],
        isPublic: [false],
        isPaid: [false],
        registrationFee: [null],
        paymentDeadlineHours: [null]
      },
      { validators: this.dateValidator }
    );
  }

  private dateValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    const errors: ValidationErrors = {};

    if (start && new Date(start) <= new Date()) {
      errors['startInPast'] = true;
    }
    if (start && end && new Date(end) <= new Date(start)) {
      errors['endBeforeStart'] = true;
    }
    return Object.keys(errors).length ? errors : null;
  }

  private loadEventForEdit(id: string): void {
    this.isLoading = true;
    this.eventService.getEventById(id).subscribe({
      next: event => {
        this.patchForm(event);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Événement introuvable.';
        this.isLoading = false;
      }
    });
  }

 private patchForm(event: CoplayEvent): void {
  console.log('=== patchForm appelé ===');
  console.log('Event complet:', event);

  this.form.patchValue({
    title: event.title,
    startDate: event.startDate?.slice(0, 16) ?? '',
    endDate: event.endDate?.slice(0, 16) ?? '',
    maxParticipants: event.maxParticipants ?? null,
    isPublic: event.isPublic ?? false,
    isPaid: event.isPaid ?? false,
    registrationFee: event.registrationFee ?? null,
    paymentDeadlineHours: event.paymentDeadlineHours ?? null
  });

  // Récupérer le teamId
  if (event.teamId && typeof event.teamId === 'object' && event.teamId.teamId) {
    this.selectedTeamId = event.teamId.teamId;
  } else if (typeof event.teamId === 'string') {
    this.selectedTeamId = event.teamId;
  }

  // ====================== FIX LOCALISATION ======================
  // Le backend renvoie la location sous la clé "locationId" (et parfois "location")
  const locationData = (event as any).locationId || (event as any).location;

  if (locationData) {
    console.log('✅ Location trouvée dans la réponse API:', locationData);

    this.selectedLocation = {
      locationId: locationData.locationId || locationData.id,
      name: locationData.name,
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude
    };

    this.locationQuery = locationData.name 
      ? locationData.name + (locationData.address ? ' — ' + locationData.address : '')
      : '';

    this.showMap = false;
  } else {
    console.log('❌ Aucune location dans l\'event');
    this.selectedLocation = null;
    this.locationQuery = '';
  }
  // ============================================================
}

  // ✅ Recherche avec Nominatim (gratuit)
  searchLocation(): void {
    if (!this.locationQuery.trim()) return;
    this.isSearchingLocation = true;
    this.locationError = '';
    this.selectedLocation = null;
    this.tempLocation = null;

    this.locationService.geocodeAddress(this.locationQuery).subscribe({
      next: (location) => {
        if (location) {
          // Afficher comme lieu temporaire pour confirmation
          this.tempLocation = {
            lat: location.latitude!,
            lng: location.longitude!,
            name: location.name,
            address: location.address
          };
          this.isSearchingLocation = false;
          this.showMap = true;
        } else {
          this.locationError = 'Adresse introuvable. Essayez une autre recherche ou cliquez sur la carte.';
          this.isSearchingLocation = false;
          this.showMap = true;
        }
      },
      error: () => {
        this.locationError = 'Erreur lors de la recherche. Essayez de cliquer sur la carte.';
        this.isSearchingLocation = false;
        this.showMap = true;
      }
    });
  }

  // ✅ Quand l'utilisateur clique sur la carte
  onMapClick(mapLocation: MapLocation): void {
    this.tempLocation = mapLocation;
    this.locationError = '';
  }

  // ✅ Confirmer le lieu sélectionné
  confirmLocation(): void {
    if (!this.tempLocation) return;

    // Créer la location
    const location: EventLocation = {
      name: this.tempLocation.name || 'Lieu sélectionné',
      address: this.tempLocation.address || '',
      latitude: this.tempLocation.lat,
      longitude: this.tempLocation.lng
    };

    // Sauvegarder dans le backend
    this.locationService.createLocation(location).subscribe({
      next: (saved) => {
        this.selectedLocation = saved;
        this.locationQuery = saved.name + (saved.address ? ' — ' + saved.address : '');
        this.tempLocation = null;
        this.showMap = false;
      },
      error: () => {
        // Utiliser sans ID si la sauvegarde échoue
        this.selectedLocation = location;
        this.locationQuery = location.name + (location.address ? ' — ' + location.address : '');
        this.tempLocation = null;
        this.showMap = false;
      }
    });
  }

  // ✅ Annuler le choix temporaire
  cancelTempLocation(): void {
    this.tempLocation = null;
  }

  // ✅ Afficher/masquer la carte
  toggleMap(): void {
    this.showMap = !this.showMap;
  }

  // ✅ Effacer la location sélectionnée
  clearLocation(): void {
    this.selectedLocation = null;
    this.tempLocation = null;
    this.locationQuery = '';
    this.locationError = '';
    this.showMap = false;
  }

  onSubmit(): void {
    console.log('=== onSubmit appelé ===');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('Formulaire invalide');
      return;
    }

    if (!this.selectedTeamId) {
      this.errorMessage = 'Veuillez sélectionner une équipe.';
      return;
    }

    const v = this.form.value;

    const payload = {
      teamId: this.selectedTeamId,
      title: v.title,
      startDate: v.startDate,
      endDate: v.endDate || null,
      locationId: this.selectedLocation?.locationId || null,
      maxParticipants: v.maxParticipants || null,
      isPublic: v.isPublic,
      isPaid: v.isPaid,
      registrationFee: v.isPaid ? v.registrationFee : null,
      paymentDeadlineHours: v.isPaid ? v.paymentDeadlineHours : null
    };

    console.log('Mode édition:', this.isEditMode);
    console.log('Event ID:', this.eventId);
    console.log('Payload envoyé:', JSON.stringify(payload, null, 2));

    this.isSubmitting = true;
    this.errorMessage = '';

    const req$ = this.isEditMode
      ? this.eventService.updateEvent(this.eventId, payload)
      : this.eventService.createEvent(payload);

    req$.subscribe({
      next: (response) => {
        console.log('Succès:', response);
        this.isSubmitting = false;
        this.router.navigate(['/events']);
      },
      error: (err) => {
        console.log('Erreur:', err);
        console.log('Erreur body:', err.error);
        this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/events']);
  }

  get isPaid(): boolean { return !!this.form.get('isPaid')?.value; }
  get f() { return this.form.controls; }
  get hasDateError() { return this.form.errors?.['startInPast'] || this.form.errors?.['endBeforeStart']; }
}