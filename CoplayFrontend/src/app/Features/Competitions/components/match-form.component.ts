import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatchService } from '../services/match.service';
import { CompetitionService } from '../services/competition.service';
import { TeamService } from '../../../services/Team/team.service';
import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { MatchStatus } from '../../../Core/Models/Competitions/MatchStatus';
import { User } from '../../../Core/Models/Auth/User';

@Component({
  selector: 'app-match-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './match-form.component.html',
  styleUrls: ['./match-form.component.css']
})
export class MatchFormComponent implements OnInit {
  @Input() show = false;
  @Output() close = new EventEmitter<boolean>();
  @Output() matchCreated = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;
  teams: any[] = [];
  competitions: any[] = [];
  userTeamId: string | null = null;
  userRole: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private competitionService: CompetitionService,
    private teamService: TeamService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      teamIdA: ['', Validators.required],
      teamIdB: ['', Validators.required],
      dateMatch: ['', Validators.required],
      competitionId: ['']
    });
  }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    
    // 1. Detect User Team
    this.authService.getCurrentUser().subscribe((user: User) => {
       if (user && user.profile) {
          this.userTeamId = user.profile.teamId || null;
          if (this.userRole === 'CAPTAIN' && this.userTeamId) {
             this.form.patchValue({ teamIdA: this.userTeamId });
          }
       }
    });

    // 2. Fetch Teams
    this.teamService.getAllTeams().subscribe((data: any[]) => {
       this.teams = data;
    });

    // 3. Fetch Competitions
    this.competitionService.getAllCompetitions().subscribe((data: any[]) => {
       this.competitions = data;
    });
  }

  isAdmin(): boolean { return this.userRole === 'ADMIN'; }

  get availableTeamsA() {
    return this.teams;
  }

  get availableTeamsB() {
    const selectedA = this.form.get('teamIdA')?.value;
    return this.teams.filter(t => t.id !== selectedA);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const formData = this.form.value;

    const request = {
      teamIdA: formData.teamIdA,
      teamIdB: formData.teamIdB,
      dateMatch: formData.dateMatch,
      competitionId: formData.competitionId || null,
      status: MatchStatus.PENDING_INVITATION
    };

    this.matchService.createMatchRequest(request).subscribe({
      next: () => {
        this.matchCreated.emit();
        this.onClose();
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = "Une erreur est survenue lors de la création du match.";
      }
    });
  }

  onClose(): void {
    this.close.emit(false);
  }
}
