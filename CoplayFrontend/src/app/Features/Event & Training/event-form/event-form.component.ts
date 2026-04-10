import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

import { CoplayEvent } from 'src/app/Core/Models/Events & Training/CoplayEvent';
import { EventLocation } from 'src/app/Core/Models/Events & Training/EventLocation';
import { Team } from 'src/app/Core/Models/Teams/Team';
import { EventService } from 'src/app/Core/Services/Events & Training/EventService/event-service.service';
import { LocationService } from 'src/app/Core/Services/Events & Training/LocationService/location-service.service';
import { TeamService } from 'src/app/services/Team/team.service';

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

  // ✅ AJOUTE : Teams
  teams: Team[] = [];
  selectedTeamId: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private locationService: LocationService,
    private teamService: TeamService  // ✅ AJOUTE
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadTeams();  // ✅ AJOUTE

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

  // ✅ AJOUTE : Charger les teams
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

    // ✅ Récupérer le teamId
    if (event.teamId && event.teamId.teamId) {
      this.selectedTeamId = event.teamId.teamId;
    }

    if (event.location) {
      this.selectedLocation = event.location;
      this.locationQuery = event.location.address
        ? `${event.location.name} — ${event.location.address}`
        : event.location.name;
    }
  }

  searchLocation(): void {
    if (!this.locationQuery.trim()) return;
    this.isSearchingLocation = true;
    this.locationError = '';
    this.selectedLocation = null;

    this.locationService.createFromAddress(this.locationQuery).subscribe({
      next: (loc: any) => {
        this.selectedLocation = loc as EventLocation;
        this.isSearchingLocation = false;
      },
      error: () => {
        this.locationError = 'Adresse introuvable. Vérifiez et réessayez.';
        this.isSearchingLocation = false;
      }
    });
  }

  clearLocation(): void {
    this.selectedLocation = null;
    this.locationQuery = '';
    this.locationError = '';
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
  console.log('Payload envoyé:', JSON.stringify(payload, null, 2));  // ✅ Voir le payload

  this.isSubmitting = true;
  this.errorMessage = '';

  const req$ = this.isEditMode
    ? this.eventService.updateEvent(this.eventId, payload)
    : this.eventService.createEvent(payload);

  req$.subscribe({
    next: (response) => {
      console.log('Succès:', response);  // ✅ Voir la réponse
      this.isSubmitting = false;
      this.router.navigate(['/events']);
    },
    error: (err) => {
      console.log('Erreur:', err);  // ✅ Voir l'erreur complète
      console.log('Erreur body:', err.error);  // ✅ Voir le message du backend
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