import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

import { CoplayEvent }    from 'src/app/Core/Models/Events & Training/CoplayEvent';
import { EventLocation }  from 'src/app/Core/Models/Events & Training/EventLocation';
import { EventService }   from 'src/app/Core/Services/Events & Training/EventService/event-service.service';
import { LocationService } from 'src/app/Core/Services/Events & Training/LocationService/location-service.service';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode   = false;
  eventId      = '';
  isLoading    = false;
  isSubmitting = false;
  errorMessage = '';

  // Recherche de lieu
  locationQuery       = '';
  isSearchingLocation = false;
  locationError       = '';
  selectedLocation: EventLocation | null = null;

  readonly teamId = 'test-team-001';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.eventId    = id;
      this.loadEventForEdit(id);
    }

    // Validateurs conditionnels selon isPaid
    this.form.get('isPaid')!.valueChanges.subscribe((isPaid: boolean) => {
      const fee      = this.form.get('registrationFee')!;
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

  // ─── Construction du formulaire ─────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group(
      {
        title:                ['', [Validators.required, Validators.minLength(3)]],
        startDate:            ['', Validators.required],
        endDate:              [''],
        maxParticipants:      [null, [Validators.min(2)]],
        isPublic:             [false],
        isPaid:               [false],
        registrationFee:      [null],
        paymentDeadlineHours: [null]
      },
      { validators: this.dateValidator }
    );
  }

  private dateValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end   = group.get('endDate')?.value;
    const errors: ValidationErrors = {};

    if (start && new Date(start) <= new Date()) {
      errors['startInPast'] = true;
    }
    if (start && end && new Date(end) <= new Date(start)) {
      errors['endBeforeStart'] = true;
    }
    return Object.keys(errors).length ? errors : null;
  }

  // ─── Chargement en mode édition ─────────────────────────────────────────────

  private loadEventForEdit(id: string): void {
    this.isLoading = true;

    // ✅ Charge directement par ID au lieu de charger tous les events
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
      title:                event.title,
      startDate:            event.startDate?.slice(0, 16)  ?? '',
      endDate:              event.endDate?.slice(0, 16)    ?? '',
      maxParticipants:      event.maxParticipants           ?? null,
      isPublic:             event.isPublic                  ?? false,
      isPaid:               event.isPaid                    ?? false,
      registrationFee:      event.registrationFee           ?? null,
      paymentDeadlineHours: event.paymentDeadlineHours      ?? null
    });
    if (event.location) {
      this.selectedLocation = event.location;
      this.locationQuery = event.location.address
        ? `${event.location.name} — ${event.location.address}`
        : event.location.name;
    }
  }

  // ─── Recherche de lieu ───────────────────────────────────────────────────────

  searchLocation(): void {
    if (!this.locationQuery.trim()) return;
    this.isSearchingLocation = true;
    this.locationError       = '';
    this.selectedLocation    = null;

    this.locationService.createFromAddress(this.locationQuery).subscribe({
      next: (loc: any) => {
        this.selectedLocation    = loc as EventLocation;
        this.isSearchingLocation = false;
      },
      error: () => {
        this.locationError       = 'Adresse introuvable. Vérifiez et réessayez.';
        this.isSearchingLocation = false;
      }
    });
  }

  clearLocation(): void {
    this.selectedLocation = null;
    this.locationQuery    = '';
    this.locationError    = '';
  }

  // ─── Soumission ─────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    // ✅ Format EventRequestDTO — on envoie locationId (String) pas l'objet complet
    const payload = {
      teamId:               this.teamId,
      title:                v.title,
      startDate:            v.startDate,
      endDate:              v.endDate || undefined,
      locationId:           this.selectedLocation?.locationId ?? undefined,
      maxParticipants:      v.maxParticipants      ?? undefined,
      isPublic:             v.isPublic,
      isPaid:               v.isPaid,
      registrationFee:      v.isPaid ? v.registrationFee      : undefined,
      paymentDeadlineHours: v.isPaid ? v.paymentDeadlineHours : undefined
    };

    this.isSubmitting = true;
    this.errorMessage = '';

    const req$ = this.isEditMode
      ? this.eventService.updateEvent(this.eventId, payload)
      : this.eventService.createEvent(payload);

    req$.subscribe({
      next:  () => { this.isSubmitting = false; this.router.navigate(['/events']); },
      error: () => { this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.'; this.isSubmitting = false; }
    });
  }

  cancel(): void {
    this.router.navigate(['/events']);
  }

  // ─── Accesseurs template ─────────────────────────────────────────────────────

  get isPaid(): boolean { return !!this.form.get('isPaid')?.value; }
  get f()               { return this.form.controls; }
  get hasDateError()    { return this.form.errors?.['startInPast'] || this.form.errors?.['endBeforeStart']; }
}