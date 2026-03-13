import { RoleEquipe } from "./RoleEquipe";
export interface TeamMember {
  id?:        string;
  teamId:     string;
  userId:     string;
  roleEquipe: RoleEquipe;
  joinedAt?:  string;
  active?:    boolean;
}