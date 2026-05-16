import { User } from "../Auth/User";
import { CoplayEvent } from "./CoplayEvent";
import { ParticipationStatus } from "./ParticipationStatus";
import { PaymentStatus } from "./PaymentStatus";
import { RSVPStatus } from "./RSVPStatus";

export interface EventParticipation {
  participationId?:    string;            // READ_ONLY — généré par MongoDB
  eventId?:            CoplayEvent;             // objet Event complet
  userId?:             String;            // ⚠️ temporaire String, sera User lors de l'intégration
  rsvpStatus?:         RSVPStatus;        // PENDING | YES | NO
  participationStatus?: ParticipationStatus; // CONFIRMED | WAITING | DECLINED | ABSENT
  paymentStatus?:      PaymentStatus;     // NOT_REQUIRED | PENDING | PAID | EXPIRED | REFUNDED
  paymentDeadline?:    string;            // deadline calculée automatiquement
  isPresent?:          boolean;           // validée par le capitaine après l'événement
  attendanceScore?:    number;            // score de fiabilité au moment de l'inscription
  respondedAt?:        string;            // date de la réponse
}