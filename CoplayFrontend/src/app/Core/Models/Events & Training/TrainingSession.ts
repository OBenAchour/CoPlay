import { TrainingProgram } from './TrainingProgram';
import { EventLocation } from './EventLocation';
import { User } from '../Auth/User';
import {EventStatus} from '../Events & Training/EventStatus'

export interface TrainingSession {
  sessionId?: string;
  title: string;
  description?: string;
  sessionDate: string;          // ISO date string
  duration?: number;             // minutes

  teamId?: any;                  // Team object ou string
  locationId?: EventLocation;
  createdBy?: User;
  program?: TrainingProgram;     // null = séance libre

  status?:              EventStatus;
  isOfficial?: boolean;
}

export interface TrainingSessionRequest {
  title: string;
  description?: string;
  sessionDate: string;
  duration?: number;
  teamId?: string;
  locationId?: string;
  createdById?: string;
  programId?: string;
}