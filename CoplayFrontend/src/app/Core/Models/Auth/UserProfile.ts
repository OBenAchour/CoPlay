
import { SportLevel } from './SportLevel';

export interface UserProfile {
    displayName: string;
    avatarUrl?: string; // le '?' signifie optionnel
    bio?: string;
    level: SportLevel;
    city: string;
    phone?: string;
    teamId?: string;
    updatedAt: Date;
}