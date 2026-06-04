package com.example.coplaybackend.Entities.Events;

import com.example.coplaybackend.Entities.Auth.User;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;


import java.time.LocalDateTime;

/**
 * Relie un joueur à un événement.
 * Porte toute la donnée de participation :
 *  - Réponse RSVP                     (rsvpStatus)
 *  - Statut dans l'événement          (participationStatus)
 *  - Paiement                         (paymentStatus + paymentDeadline)
 *  - Présence réelle                  (isPresent)
 *  - Score de fiabilité au moment J   (attendanceScore)
 *
 * @CompoundIndex : un joueur ne peut avoir qu'une seule participation par événement.
 */
@Document(collection = "event_participations")
@CompoundIndex(name = "event_user_unique", def = "{'eventId': 1, 'userId': 1}", unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventParticipation {

    @Id
    private String participationId;


    private Event eventId;         // ref → Event


    private User userId;          // ref → User (module Auth)

    // ── RSVP ───────────────────────────────────────────────────────
    /**
     * Réponse du joueur à l'invitation.
     * PENDING par défaut — le joueur n'a pas encore répondu.
     * Peut être modifié tant que l'événement est SCHEDULED.
     */
    @Builder.Default
    private RSVPStatus rsvpStatus = RSVPStatus.PENDING;

    // ── Statut de participation ────────────────────────────────────
    /**
     * Position du joueur dans l'événement.
     * CONFIRMED → dans les maxParticipants (priorité par score)
     * WAITING   → liste d'attente
     * DECLINED  → a répondu NO
     * ABSENT    → no-show validé par le capitaine → pénalité score
     */
    @Builder.Default

    private ParticipationStatus participationStatus = ParticipationStatus.WAITING;

    // ── Paiement ───────────────────────────────────────────────────
    /**
     * Statut du paiement via Flouci.
     * NOT_REQUIRED si l'événement est gratuit.
     * PENDING après réponse YES → le joueur a X heures pour payer.
     */
    @Builder.Default

    private PaymentStatus paymentStatus = PaymentStatus.NOT_REQUIRED;

    /**
     * Deadline calculée automatiquement :
     * = heure du YES + paymentDeadlineHours de l'événement.
     * Null si l'événement est gratuit.
     */

    private LocalDateTime paymentDeadline;

    /**
     * Identifiant de la transaction Flouci générée à l'initiation du paiement.
     * Sert à vérifier le statut au retour de la page de paiement Flouci.
     */
    private String flouciPaymentId;

    // ── Présence réelle ────────────────────────────────────────────
    /**
     * Validée manuellement par le capitaine après l'événement.
     * false par défaut — le capitaine doit explicitement confirmer.
     */
    @Builder.Default
    private Boolean isPresent = false;

    // ── Score de fiabilité ─────────────────────────────────────────
    /**
     * Score du joueur AU MOMENT de son inscription à l'événement.
     * Utilisé pour déterminer sa priorité dans la liste d'attente.
     * Plus le score est élevé, plus le joueur a priorité sur les places.
     * Score initial = 50 (neutre pour les nouveaux joueurs).
     */
    @Builder.Default
    private Integer attendanceScore = 50;

    // ── Dates ──────────────────────────────────────────────────────

    private LocalDateTime respondedAt;
}