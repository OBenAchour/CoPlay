package com.example.coplaybackend.Repositories.Events;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Events.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventParticipationRepository extends MongoRepository<EventParticipation, String> {

    // ── RSVP ───────────────────────────────────────────────────────
    //
    // NOTE : `eventId` et `userId` sont des sous-documents Event/User complets.
    // On interroge par leur identifiant imbriqué (eventId.eventId / userId.userId)
    // et NON par l'objet entier : la copie embarquée est figée au moment de
    // l'inscription, donc un match par objet complet échoue dès que l'événement
    // change d'état (ex. SCHEDULED → COMPLETED), ce qui cassait la validation
    // des présences et le listing des participations.

    /** Toutes les participations d'un événement → US-031 */
    List<EventParticipation> findByEventId_EventId(String eventId);

    /** Participation d'un joueur à un événement → US-029 / US-030 */
    Optional<EventParticipation> findByEventId_EventIdAndUserId_UserId(String eventId, String userId);

    /** Toutes les participations d'un joueur → US-037 */
    List<EventParticipation> findByUserId_UserId(String userId);

    // ── Liste d'attente ────────────────────────────────────────────

    /** Compte les CONFIRMED → vérifie si places disponibles */
    long countByEventId_EventIdAndParticipationStatus(String eventId, ParticipationStatus status);

    /** WAITING triés par score décroissant → priorité au meilleur score */
    List<EventParticipation> findByEventId_EventIdAndParticipationStatusOrderByAttendanceScoreDesc(
            String eventId, ParticipationStatus status);

    // ── Paiement ───────────────────────────────────────────────────

    /** Joueurs ayant payé → pour remboursement si annulation */
    List<EventParticipation> findByEventId_EventIdAndPaymentStatus(String eventId, PaymentStatus paymentStatus);

    /** Paiements PENDING dont la deadline est dépassée → expiration */
    List<EventParticipation> findByPaymentStatusAndPaymentDeadlineBefore(
            PaymentStatus paymentStatus, LocalDateTime deadline);

    // ── Suppression ────────────────────────────────────────────────

    /** Supprime toutes les participations sauf les remboursées → US-028 */
    void deleteByEventId_EventIdAndPaymentStatusNot(String eventId, PaymentStatus paymentStatus);
}