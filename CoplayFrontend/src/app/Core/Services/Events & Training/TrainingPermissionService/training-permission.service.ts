import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { AuthService } from '../../Auth/auth.service';

/**
 * TrainingPermissionService — gestion des permissions pour le module Training.
 *
 * Ce service centralise toutes les vérifications de droits propres au
 * module Training, sans modifier l'AuthService du module Auth.
 *
 * Architecture :
 *  - Utilise AuthService pour récupérer le rôle global (ADMIN, COACH, etc.)
 *  - Appelle l'endpoint Teams pour le rôle dans l'équipe (RoleEquipe)
 *
 * Compatibilité automatique :
 *  - Si l'endpoint Teams n'est pas encore disponible → fallback sur le rôle global
 *  - Quand le module Teams sera intégré → la vraie logique fonctionnera sans modif
 */
@Injectable({
  providedIn: 'root'
})
export class TrainingPermissionService {

  // URL de l'endpoint Teams attendu (à confirmer avec le coéquipier Teams)
  // Format attendu : { role: "COACH" | "CAPTAIN" | "PLAYER" | "STAFF" }
  private teamsApiUrl = 'http://localhost:8080/api/teams';

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  // ═══════════════════════════════════════════════════════════════
  //  RÔLES GLOBAUX (synchrones, lus depuis le JWT)
  // ═══════════════════════════════════════════════════════════════

  /** Vérifie si l'utilisateur est COACH au niveau plateforme. */
  isCoach(): boolean {
    return this.authService.getUserRole() === 'COACH';
  }

  /** Vérifie si l'utilisateur est PLAYER au niveau plateforme. */
  isPlayer(): boolean {
    return this.authService.getUserRole() === 'PLAYER';
  }

  /** Vérifie si l'utilisateur est SPECTATOR (consultation uniquement). */
  isSpectator(): boolean {
    return this.authService.getUserRole() === 'SPECTATOR';
  }

  // ═══════════════════════════════════════════════════════════════
  //  RÔLES DANS L'ÉQUIPE (asynchrones, appel API Teams)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Vérifie si l'utilisateur est COACH d'une équipe spécifique.
   *
   * Endpoint attendu : GET /api/teams/{teamId}/members/me/role
   * Retourne : { role: "COACH" | "CAPTAIN" | "PLAYER" | "STAFF" }
   *
   * Fallback : si l'endpoint n'existe pas encore (module Teams pas intégré),
   * on utilise le rôle global COACH ou ADMIN.
   */
  isCoachOfTeam(teamId: string): Observable<boolean> {
    // Court-circuit : ADMIN global = autorisé partout
    if (this.authService.isAdmin()) {
      return of(true);
    }

    return this.http.get<{ role: string }>(`${this.teamsApiUrl}/${teamId}/members/me/role`)
      .pipe(
        map(response => response.role === 'COACH'),
        catchError(() => of(this.isCoach())) // fallback sur rôle global
      );
  }

  /**
   * Vérifie si l'utilisateur est CAPTAIN d'une équipe spécifique.
   * (utile pour la validation des présences plus tard)
   */
  isCaptainOfTeam(teamId: string): Observable<boolean> {
    if (this.authService.isAdmin()) {
      return of(true);
    }

    return this.http.get<{ role: string }>(`${this.teamsApiUrl}/${teamId}/members/me/role`)
      .pipe(
        map(response => response.role === 'CAPTAIN'),
        catchError(() => of(false))
      );
  }

  /**
   * Vérifie si l'utilisateur est membre d'une équipe (n'importe quel rôle).
   */
  isMemberOfTeam(teamId: string): Observable<boolean> {
    if (this.authService.isAdmin()) {
      return of(true);
    }

    return this.http.get<{ role: string }>(`${this.teamsApiUrl}/${teamId}/members/me/role`)
      .pipe(
        map(response => !!response.role),
        catchError(() => of(true)) // par défaut on autorise (à durcir après intégration)
      );
  }

  // ═══════════════════════════════════════════════════════════════
  //  PERMISSIONS MÉTIER (composées)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Peut créer/modifier/supprimer un programme pour une équipe.
   * Règle : ADMIN global OU COACH de l'équipe.
   */
  canManageProgram(teamId: string): Observable<boolean> {
    return this.isCoachOfTeam(teamId);
  }

  /**
   * Peut créer une séance OFFICIELLE (avec programme).
   * Règle : ADMIN global OU COACH de l'équipe.
   */
  canCreateOfficialSession(teamId: string): Observable<boolean> {
    return this.isCoachOfTeam(teamId);
  }

  /**
   * Peut créer une séance LIBRE (sans programme).
   * Règle : tout membre de l'équipe.
   */
  canCreateFreeSession(teamId: string): Observable<boolean> {
    return this.isMemberOfTeam(teamId);
  }

  /**
   * Peut modifier/annuler une séance.
   * Règle : ADMIN OU COACH de l'équipe OU créateur de la séance.
   */
  canEditSession(teamId: string, sessionCreatorId: string): Observable<boolean> {
    if (this.authService.isAdmin()) return of(true);
    if (this.authService.getUserId() === sessionCreatorId) return of(true);
    return this.isCoachOfTeam(teamId);
  }

  /**
   * Peut marquer une séance comme COMPLETED.
   * Règle : ADMIN OU COACH de l'équipe.
   */
  canCompleteSession(teamId: string): Observable<boolean> {
    return this.isCoachOfTeam(teamId);
  }
}