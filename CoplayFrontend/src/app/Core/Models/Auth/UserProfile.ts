import { SportLevel } from "./SportLevel";
export interface UserProfile {
  profileId?:   string;
  userId:       string;
  displayName:  string;
  avatarUrl?:   string;
  bio?:         string;
  level?:       SportLevel;
  city?:        string;
  phone?:       string;
  updatedAt?:   string;
}