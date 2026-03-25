import { Role } from './Role';
import { UserProfile } from './UserProfile';

export interface User {
    userId: string;
    email: string;
    role: Role;
    isActive: boolean;
    isEmailVerified: boolean;
    profile: UserProfile; // L'objet profile est ICI
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}