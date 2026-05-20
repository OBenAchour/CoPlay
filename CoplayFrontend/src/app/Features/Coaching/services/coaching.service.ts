import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CoachProfile, Injury, MedicalRecord, NutritionPlan, ProgressEntry,
  PerformanceMetric, CoachingProgram, LibraryExercise
} from '../../../Core/Models/Coaching/Coaching';

const BASE = 'http://localhost:8080/api/coaching';

@Injectable({ providedIn: 'root' })
export class CoachingService {
  constructor(private http: HttpClient) {}

  // Coach profiles
  upsertCoachProfile(req: Partial<CoachProfile>): Observable<CoachProfile> { return this.http.post<CoachProfile>(`${BASE}/coach-profiles`, req); }
  myCoachProfile(): Observable<CoachProfile> { return this.http.get<CoachProfile>(`${BASE}/coach-profiles/me`); }
  listCoaches(verifiedOnly = true, page = 0, size = 20): Observable<any> {
    return this.http.get(`${BASE}/coach-profiles`, { params: { verifiedOnly, page, size } as any });
  }

  // Admin — coach verification workflow
  getPendingCoaches(): Observable<CoachProfile[]> {
    return this.http.get<CoachProfile[]>(`${BASE}/coach-profiles/pending`);
  }
  approveCoach(id: string): Observable<CoachProfile> {
    return this.http.put<CoachProfile>(`${BASE}/coach-profiles/${id}/approve`, {});
  }
  rejectCoach(id: string, reason: string): Observable<CoachProfile> {
    return this.http.put<CoachProfile>(`${BASE}/coach-profiles/${id}/reject`, { reason });
  }

  // Injuries
  myInjuries(): Observable<Injury[]> { return this.http.get<Injury[]>(`${BASE}/injuries/me`); }
  createInjury(i: Partial<Injury>): Observable<Injury> { return this.http.post<Injury>(`${BASE}/injuries`, i); }
  updateInjury(id: string, i: Partial<Injury>): Observable<Injury> { return this.http.put<Injury>(`${BASE}/injuries/${id}`, i); }
  deleteInjury(id: string): Observable<void> { return this.http.delete<void>(`${BASE}/injuries/${id}`); }

  // Medical record
  myMedical(): Observable<MedicalRecord> { return this.http.get<MedicalRecord>(`${BASE}/medical-record/me`); }
  upsertMedical(r: Partial<MedicalRecord>): Observable<MedicalRecord> { return this.http.post<MedicalRecord>(`${BASE}/medical-record`, r); }
  authorizeCoach(coachUserId: string): Observable<MedicalRecord> { return this.http.post<MedicalRecord>(`${BASE}/medical-record/authorize/${coachUserId}`, {}); }
  revokeCoach(coachUserId: string): Observable<MedicalRecord> { return this.http.delete<MedicalRecord>(`${BASE}/medical-record/authorize/${coachUserId}`); }

  // Nutrition
  myNutrition(): Observable<NutritionPlan[]> { return this.http.get<NutritionPlan[]>(`${BASE}/nutrition/me`); }
  createNutrition(p: Partial<NutritionPlan>): Observable<NutritionPlan> { return this.http.post<NutritionPlan>(`${BASE}/nutrition`, p); }
  deleteNutrition(id: string): Observable<void> { return this.http.delete<void>(`${BASE}/nutrition/${id}`); }

  // Hydration
  logHydration(ml: number, goalMl?: number) {
    const params: any = { ml }; if (goalMl) params.goalMl = goalMl;
    return this.http.post(`${BASE}/hydration/log`, null, { params });
  }
  hydrationRange(from: string, to: string) {
    return this.http.get<any[]>(`${BASE}/hydration/range`, { params: { from, to } });
  }

  // Progress
  myProgress(): Observable<ProgressEntry[]> { return this.http.get<ProgressEntry[]>(`${BASE}/progress/me`); }
  recordProgress(p: Partial<ProgressEntry>): Observable<ProgressEntry> { return this.http.post<ProgressEntry>(`${BASE}/progress`, p); }

  // Performance
  myPerformance(): Observable<PerformanceMetric[]> { return this.http.get<PerformanceMetric[]>(`${BASE}/performance/me`); }
  recordPerformance(m: Partial<PerformanceMetric>): Observable<PerformanceMetric> { return this.http.post<PerformanceMetric>(`${BASE}/performance`, m); }
  riskFor(userId: string): Observable<any> { return this.http.get(`${BASE}/performance/risk/${userId}`); }

  // Exercise library
  listExercises(page = 0, size = 50): Observable<any> { return this.http.get(`${BASE}/exercises`, { params: { page, size } as any }); }
  createExercise(e: Partial<LibraryExercise>): Observable<LibraryExercise> { return this.http.post<LibraryExercise>(`${BASE}/exercises`, e); }
  uploadExerciseVideo(id: string, file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post(`${BASE}/exercises/${id}/video`, fd);
  }

  // Programs
  programsAsCoach(): Observable<CoachingProgram[]> { return this.http.get<CoachingProgram[]>(`${BASE}/programs/coach/me`); }
  programsAsClient(): Observable<CoachingProgram[]> { return this.http.get<CoachingProgram[]>(`${BASE}/programs/client/me`); }
  createProgram(p: Partial<CoachingProgram>): Observable<CoachingProgram> { return this.http.post<CoachingProgram>(`${BASE}/programs`, p); }
  updateProgram(id: string, p: Partial<CoachingProgram>): Observable<CoachingProgram> { return this.http.put<CoachingProgram>(`${BASE}/programs/${id}`, p); }
  assignProgram(id: string, clientId: string, clientType = 'USER') {
    return this.http.patch(`${BASE}/programs/${id}/assign`, null, { params: { clientId, clientType } });
  }
  completeDay(programId: string, week: number, day: number) {
    return this.http.patch(`${BASE}/programs/${programId}/complete-day`, null, { params: { week, day } as any });
  }
  getProgram(id: string): Observable<CoachingProgram> { return this.http.get<CoachingProgram>(`${BASE}/programs/${id}`); }

  // AI
  generateProgram(req: any): Observable<CoachingProgram> { return this.http.post<CoachingProgram>(`${BASE}/ai/programs/generate`, req); }
  generateNutrition(req: any): Observable<NutritionPlan> { return this.http.post<NutritionPlan>(`${BASE}/ai/nutrition/generate`, req); }
  injuryRisk(userId?: string): Observable<any> {
    return this.http.get(`${BASE}/ai/injury-risk`, { params: userId ? { userId } : {} });
  }
  recovery(): Observable<any> { return this.http.get(`${BASE}/ai/recovery`); }
  chat(message: string): Observable<{ reply: string }> { return this.http.post<{ reply: string }>(`${BASE}/ai/chat`, { message }); }
}
