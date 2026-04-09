import { EventLocation } from "./EventLocation";
import { EventStatus } from "./EventStatus";

export interface CoplayEvent {
  eventId?:             string;      // READ_ONLY — généré par MongoDB
  teamId:               any;      // ⚠️ temporaire String, sera Team lors de l'intégration
  title:                string;
  startDate:            string;      // format ISO : "2026-04-01T10:00:00"
  endDate?:             string;
  location?:            EventLocation;    // objet Location complet (pas locationId séparé)
  status?:              EventStatus;
  isPublic?:            boolean;
 
  // Capacité & liste d'attente
  maxParticipants?:     number;
 
  // Paiement
  isPaid?:              boolean;
  registrationFee?:     number;      // montant en DT
  paymentDeadlineHours?: number;     // délai en heures défini par le capitaine
}