import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrainingProgram } from 'src/app/Core/Models/Events & Training/TrainingProgram';
import { Exercise } from 'src/app/Core/Models/Events & Training/Exercise';


@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  private baseUrl = 'http://localhost:8080/api/training';

  constructor(private http: HttpClient) {}

  // ═══════════════════════════════════════════════════════════════
  //  PROGRAMMES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crée un nouveau programme d'entraînement.
   * POST /api/training/add
   */
  createProgram(program: TrainingProgram): Observable<TrainingProgram> {
    return this.http.post<TrainingProgram>(`${this.baseUrl}/add`, program);
  }

  /**
   * Retourne TOUS les programmes (toutes équipes confondues).
   * GET /api/training/all
   */
  getAllPrograms(): Observable<TrainingProgram[]> {
    return this.http.get<TrainingProgram[]>(`${this.baseUrl}/all`);
  }

  /**
   * Modifie un programme existant.
   * PUT /api/training/update/{programId}
   */
  updateProgram(programId: string, program: TrainingProgram): Observable<TrainingProgram> {
    return this.http.put<TrainingProgram>(`${this.baseUrl}/update/${programId}`, program);
  }

  /**
   * Retourne un programme par son ID.
   * GET /api/training/get/{programId}
   */
  getProgramById(programId: string): Observable<TrainingProgram> {
    return this.http.get<TrainingProgram>(`${this.baseUrl}/get/${programId}`);
  }

  /**
   * Retourne tous les programmes d'une équipe.
   * GET /api/training/get/team/{teamId}
   */
  getProgramsByTeam(teamId: string): Observable<TrainingProgram[]> {
    return this.http.get<TrainingProgram[]>(`${this.baseUrl}/get/team/${teamId}`);
  }

  /**
   * Retourne les programmes filtrés par niveau.
   * GET /api/training/get/level/{level}
   */
  getProgramsByLevel(level: string): Observable<TrainingProgram[]> {
    return this.http.get<TrainingProgram[]>(`${this.baseUrl}/get/level/${level}`);
  }

  /**
   * Supprime un programme et tous ses exercices.
   * DELETE /api/training/delete/{programId}
   */
  deleteProgram(programId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${programId}`);
  }

  // ═══════════════════════════════════════════════════════════════
  //  EXERCICES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Ajoute un exercice dans un programme.
   * POST /api/training/exercises/add/{programId}
   */
  addExercise(programId: string, exercise: Exercise): Observable<TrainingProgram> {
    return this.http.post<TrainingProgram>(
      `${this.baseUrl}/exercises/add/${programId}`,
      exercise
    );
  }

  /**
   * Modifie un exercice existant.
   * PUT /api/training/exercises/update/{programId}/{exerciseId}
   */
  updateExercise(
    programId: string,
    exerciseId: string,
    exercise: Exercise
  ): Observable<TrainingProgram> {
    return this.http.put<TrainingProgram>(
      `${this.baseUrl}/exercises/update/${programId}/${exerciseId}`,
      exercise
    );
  }

  /**
   * Supprime un exercice d'un programme.
   * DELETE /api/training/exercises/delete/{programId}/{exerciseId}
   */
  removeExercise(programId: string, exerciseId: string): Observable<TrainingProgram> {
    return this.http.delete<TrainingProgram>(
      `${this.baseUrl}/exercises/delete/${programId}/${exerciseId}`
    );
  }
}