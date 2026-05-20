import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService }       from '../../services/Team/team.service';
import { TeamMemberService } from '../../services/TeamMember/team-member.service';
import { AuthService }       from '../../Core/Services/Auth/auth.service';
import { Team }       from '../../Core/Models/Teams/Team';
import { TeamMember } from '../../Core/Models/Teams/TeamMember';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-coach',
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.css']
})
export class CoachComponent implements OnInit {

  coaches: { member: TeamMember; team: Team }[] = [];
  loading = true;
  currentUserId = '';

  constructor(
    private teamSvc:   TeamService,
    private memberSvc: TeamMemberService,
    private auth:      AuthService,
    public  router:    Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.auth.getUserId();
    this.loadCoaches();
  }

  loadCoaches(): void {
    this.loading = true;
    this.teamSvc.getAllTeams().subscribe({
      next: (teams: any[]) => {
        if (!teams.length) { this.loading = false; return; }
        const checks = teams.map(t =>
          this.memberSvc.getMembers(t.teamId).pipe(
            catchError(() => of([])),
            map((members: TeamMember[]) => ({ team: t, members }))
          )
        );
        forkJoin(checks).subscribe(results => {
          this.coaches = [];
          results.forEach(({ team, members }) => {
            members
              .filter((m: TeamMember) => m.roleEquipe === 'COACH' && m.active !== false)
              .forEach((m: TeamMember) => this.coaches.push({ member: m, team }));
          });
          this.loading = false;
        });
      },
      error: () => { this.loading = false; }
    });
  }

  goToCoachingModule(): void {
    this.router.navigate(['/coaching/coaches']);
  }

  teamInitial(name: string): string {
    return (name || '??').substring(0, 2).toUpperCase();
  }
}
