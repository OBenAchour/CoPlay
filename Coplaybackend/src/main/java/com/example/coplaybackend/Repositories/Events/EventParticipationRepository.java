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

    /** Toutes les participations d'un événement → US-031 */
    List<EventParticipation> findByEventId(Event event);

    /** Participation d'un joueur à un événement → US-029 / US-030 */
    Optional<EventParticipation> findByEventIdAndUserId(Event event, User user);

    /** Toutes les participations d'un joueur → US-037 */
    List<EventParticipation> findByUserId(User user);

    /** Participants par statut RSVP */
    List<EventParticipation> findByEventIdAndRsvpStatus(Event event, RSVPStatus rsvpStatus);

    // ── Liste d'attente ────────────────────────────────────────────

    /** Compte les CONFIRMED → vérifie si places disponibles */
    long countByEventIdAndParticipationStatus(Event event, ParticipationStatus status);

    /** WAITING triés par score décroissant → priorité au meilleur score */
    List<EventParticipation> findByEventIdAndParticipationStatusOrderByAttendanceScoreDesc(
            Event event, ParticipationStatus status);

    /** Participations par statut de participation */
    List<EventParticipation> findByEventIdAndParticipationStatus(
            Event event, ParticipationStatus status);

    // ── Paiement ───────────────────────────────────────────────────

    /** Joueurs ayant payé → pour remboursement si annulation */
    List<EventParticipation> findByEventIdAndPaymentStatus(Event event, PaymentStatus paymentStatus);

    /** Paiements PENDING dont la deadline est dépassée → expiration */
    List<EventParticipation> findByPaymentStatusAndPaymentDeadlineBefore(
            PaymentStatus paymentStatus, LocalDateTime deadline);

    // ── Présences ──────────────────────────────────────────────────

    /** Présences confirmées par le capitaine → US-037 */
    List<EventParticipation> findByEventIdAndIsPresent(Event event, Boolean isPresent);

    // ── Suppression ────────────────────────────────────────────────

    /** Supprime toutes les participations sauf les remboursées → US-028 */
    void deleteByEventIdAndPaymentStatusNot(Event event, PaymentStatus paymentStatus);

    /** Supprime toutes les participations d'un événement */
    void deleteByEventId(Event event);
}