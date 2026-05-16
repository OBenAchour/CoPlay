export interface Reclamation {
  id?: string;
  nomComplet: string;
  email: string;
  objet: string;
  message: string;
  dateCreation?: Date;
  traitee: boolean;
}