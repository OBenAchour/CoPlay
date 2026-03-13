import {Role} from "./Role"

export interface User {
  userId?:          string;
  email:            string;
  passwordHash?:    string;       // jamais renvoyé par l'API
  role:             Role;
  isEmailVerified?: boolean;
  isActive?:        boolean;
  createdAt?:       string;       // ISO 8601
  updatedAt?:       string;
  lastLoginAt?:     string;
}