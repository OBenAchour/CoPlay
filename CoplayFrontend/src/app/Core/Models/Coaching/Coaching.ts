export interface Certification { name: string; issuer: string; year: number; documentUrl?: string; verified?: boolean; }
export interface Availability { dayOfWeek: string; startTime: string; endTime: string; }

export interface CoachProfile {
  coachProfileId?: string;
  userId?: string;
  bio?: string;
  specialties?: string[];
  certifications?: Certification[];
  yearsExperience?: number;
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  availability?: Availability[];
  city?: string;
}

export interface Injury {
  injuryId?: string;
  userId?: string;
  bodyPart: string;
  type: string;
  severity: string;
  dateOccurred?: string;
  expectedRecovery?: string;
  status?: 'ACTIVE' | 'HEALING' | 'RECOVERED';
  notes?: string;
  recoveryPlan?: string;
}

export interface MedicalRecord {
  recordId?: string;
  userId?: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  lastCheckup?: string;
  authorizedCoachIds?: string[];
  consent?: boolean;
}

export interface Meal { name: string; description?: string; calories?: number; ingredients?: string[]; }
export interface NutritionPlan {
  planId?: string;
  userId?: string;
  objective?: string;
  dailyCalories?: number;
  proteinsG?: number;
  carbsG?: number;
  fatsG?: number;
  hydrationGoalMl?: number;
  meals?: Meal[];
  aiGenerated?: boolean;
}

export interface ProgressEntry {
  entryId?: string;
  userId?: string;
  date?: string;
  weightKg?: number;
  bodyFatPct?: number;
  metrics?: { [k: string]: number };
  notes?: string;
}

export interface PerformanceMetric {
  metricId?: string;
  userId?: string;
  date?: string;
  sessionLoad?: number;
  minutes?: number;
  rpe?: number;
  distanceKm?: number;
  avgSpeedKmh?: number;
  caloriesBurned?: number;
  activity?: string;
}

export interface ProgramExercise { exerciseId?: string; name: string; sets?: number; reps?: number; durationSec?: number; restSec?: number; notes?: string; }
export interface DaySession { dayOfWeek: string; title: string; exercises: ProgramExercise[]; completed?: boolean; }
export interface WeekPlan { weekNumber: number; focus?: string; days: DaySession[]; }

export interface CoachingProgram {
  programId?: string;
  coachId?: string;
  clientId?: string;
  clientType?: 'USER' | 'TEAM';
  title: string;
  description?: string;
  objective?: string;
  level?: string;
  durationWeeks?: number;
  aiGenerated?: boolean;
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  weeklyPlan?: WeekPlan[];
}

export interface LibraryExercise {
  exerciseId?: string;
  name: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  muscleGroups?: string[];
  equipmentNeeded?: string;
  difficulty?: string;
  instructions?: string;
  caloriesPerMin?: number;
}
