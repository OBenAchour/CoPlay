package com.example.coplaybackend.Services.Events;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Events.*;
import com.example.coplaybackend.Repositories.Events.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventParticipationRepository participationRepository;
    private final LocationRepository locationRepository;

    // ═══════════════════════════════════════════════════════════════
    //  1. GESTION DES ÉVÉNEMENTS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Crée un nouvel événement.
     *
     * Règles métier :
     *  - startDate doit être dans le futur
     *  - endDate doit être après startDate
     *  - Si isPaid = true → registrationFee et paymentDeadlineHours obligatoires
     *  - paymentDeadlineHours ne peut pas dépasser la durée avant l'événement
     *  - Statut forcé à SCHEDULED à la création
     *
     * US-024 / US-026
     */
    public Event createEvent(Event event) {
        // Règle 1 : startDate dans le futur
        if (event.getStartDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("La date de début doit être dans le futur.");
        }

        // Règle 2 : endDate après startDate
        if (event.getEndDate().isBefore(event.getStartDate())) {
            throw new IllegalArgumentException("La date de fin doit être après la date de début.");
        }

        // Règle 3 : si payant → vérifier les champs obligatoires
        if (Boolean.TRUE.equals(event.getIsPaid())) {
            if (event.getRegistrationFee() == null || event.getRegistrationFee() <= 0) {
                throw new IllegalArgumentException("Le montant de l'inscription est obligatoire.");
            }
            if (event.getPaymentDeadlineHours() == null || event.getPaymentDeadlineHours() <= 0) {
                throw new IllegalArgumentException("Le délai de paiement est obligatoire.");
            }

            // Règle 4 : paymentDeadlineHours ne dépasse pas la durée avant l'événement
            long hoursUntilEvent = java.time.Duration.between(
                    LocalDateTime.now(), event.getStartDate()).toHours();

            if (event.getPaymentDeadlineHours() > hoursUntilEvent) {
                throw new IllegalArgumentException(
                        "Le délai de paiement (" + event.getPaymentDeadlineHours() +
                                "h) dépasse la durée avant l'événement (" + hoursUntilEvent + "h).");
            }
        }

        // Statut forcé à SCHEDULED
        event.setStatus(EventStatus.SCHEDULED);

        return eventRepository.save(event);
    }

    /**
     * Modifie un événement existant.
     * Bloqué si l'événement n'est pas SCHEDULED.
     * US-027
     */
    public Event updateEvent(String eventId, Event updatedData) {
        Event existing = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement introuvable : " + eventId));

        if (existing.getStatus() != EventStatus.SCHEDULED) {
            throw new IllegalStateException("Impossible de modifier un événement " + existing.getStatus());
        }

        existing.setTitle(updatedData.getTitle());
        existing.setStartDate(updatedData.getStartDate());
        existing.setEndDate(updatedData.getEndDate());
        existing.setLocationId(updatedData.getLocationId());
        existing.setIsPublic(updatedData.getIsPublic());
        existing.setMaxParticipants(updatedData.getMaxParticipants());
        existing.setIsPaid(updatedData.getIsPaid());
        existing.setRegistrationFee(updatedData.getRegistrationFee());
        existing.setPaymentDeadlineHours(updatedData.getPaymentDeadlineHours());

        return eventRepository.save(existing);
    }

    /**
     * Annule un événement.
     *
     * Règles :
     *  - Bloqué si COMPLETED ou CANCELLED
     *  - Si payant → tous les PAID passent à REFUNDED
     *  - Supprime toutes les participations non remboursées
     *
     * US-028
     */
    public void cancelEvent(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement introuvable : " + eventId));

        if (event.getStatus() == EventStatus.COMPLETED ||
                event.getStatus() == EventStatus.CANCELLED) {
            throw new IllegalStateException("Impossible d'annuler un événement " + event.getStatus());
        }

        // Si payant → rembourser tous les joueurs ayant payé
        if (Boolean.TRUE.equals(event.getIsPaid())) {
            List<EventParticipation> paidParticipations =
                    participationRepository.findByEventIdAndPaymentStatus(event, PaymentStatus.PAID);

            paidParticipations.forEach(p -> {
                p.setPaymentStatus(PaymentStatus.REFUNDED);
                // TODO : appel API Flouci pour remboursement réel
                participationRepository.save(p);
            });
        }

        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);

        // Supprimer toutes les participations non remboursées
        participationRepository.deleteByEventIdAndPaymentStatusNot(event, PaymentStatus.REFUNDED);
    }

    /**
     * Retourne tous les événements d'une équipe.
     * US-032
     */
    public List<Event> getEventsByTeam(String teamId) {
        return eventRepository.findByTeamId(teamId);
    }

    /**
     * Retourne les événements d'une équipe filtrés par statut.
     */
    public List<Event> getEventsByTeamAndStatus(String teamId, EventStatus status) {
        return eventRepository.findByTeamIdAndStatus(teamId, status);
    }

    /**
     * Retourne tous les événements publics à venir.
     */
    public List<Event> getPublicUpcomingEvents() {
        return eventRepository.findByIsPublicTrueAndStartDateAfter(LocalDateTime.now());
    }

    // ═══════════════════════════════════════════════════════════════
    //  2. GESTION DU RSVP + LISTE D'ATTENTE + PAIEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Un joueur répond YES ou NO à un événement.
     *
     * Logique complète :
     *
     * Si YES :
     *  1. Compter les CONFIRMED existants
     *  2. Places disponibles ?
     *     → OUI : participationStatus = CONFIRMED
     *     → NON : participationStatus = WAITING
     *  3. Priorité par score de fiabilité (attendanceScore)
     *  4. Si événement payant :
     *     → paymentStatus = PENDING
     *     → paymentDeadline = maintenant + paymentDeadlineHours
     *
     * Si NO :
     *  → participationStatus = DECLINED
     *  → score inchangé
     *  → si était CONFIRMED → prochain WAITING promu
     *
     * US-029 / US-030
     *
     * @param event              l'objet Event complet
     * @param user               l'objet User complet
     * @param rsvpStatus         YES ou NO
     * @param userAttendanceScore score de fiabilité actuel du joueur
     */
    public EventParticipation respondToEvent(Event event, User user,
                                             RSVPStatus rsvpStatus,
                                             Integer userAttendanceScore) {
        // Vérification : événement est SCHEDULED
        if (event.getStatus() != EventStatus.SCHEDULED) {
            throw new IllegalStateException("Impossible de répondre à un événement " + event.getStatus());
        }

        // Participation existante ?
        return participationRepository.findByEventIdAndUserId(event, user)
                .map(existing -> updateExistingParticipation(existing, event, rsvpStatus))
                .orElseGet(() -> createNewParticipation(event, user, rsvpStatus, userAttendanceScore));
    }

    /**
     * Crée une nouvelle participation.
     * Appelé quand le joueur répond pour la première fois.
     */
    private EventParticipation createNewParticipation(Event event, User user,
                                                      RSVPStatus rsvpStatus,
                                                      Integer userAttendanceScore) {
        EventParticipation participation = EventParticipation.builder()
                .eventId(event)                          // ✅ objet Event complet
                .userId(user)                            // ✅ objet User complet
                .rsvpStatus(rsvpStatus)
                .attendanceScore(userAttendanceScore != null ? userAttendanceScore : 50)
                .isPresent(false)
                .respondedAt(LocalDateTime.now())
                .build();

        if (rsvpStatus == RSVPStatus.YES) {
            applyYesLogic(participation, event);
        } else if (rsvpStatus == RSVPStatus.NO) {
            participation.setParticipationStatus(ParticipationStatus.DECLINED);
            participation.setPaymentStatus(PaymentStatus.NOT_REQUIRED);
        }

        return participationRepository.save(participation);
    }

    /**
     * Met à jour une participation existante.
     * Appelé quand le joueur change sa réponse.
     */
    private EventParticipation updateExistingParticipation(EventParticipation existing,
                                                           Event event,
                                                           RSVPStatus rsvpStatus) {
        ParticipationStatus oldStatus = existing.getParticipationStatus();
        existing.setRsvpStatus(rsvpStatus);
        existing.setRespondedAt(LocalDateTime.now());

        if (rsvpStatus == RSVPStatus.YES) {
            applyYesLogic(existing, event);
        } else if (rsvpStatus == RSVPStatus.NO) {
            existing.setParticipationStatus(ParticipationStatus.DECLINED);
            existing.setPaymentStatus(PaymentStatus.NOT_REQUIRED);
            existing.setPaymentDeadline(null);

            // Si était CONFIRMED → libérer la place et promouvoir le prochain WAITING
            if (oldStatus == ParticipationStatus.CONFIRMED) {
                promoteNextWaiting(event);
            }
        }

        return participationRepository.save(existing);
    }

    /**
     * Applique la logique YES :
     *  - Vérifie les places disponibles
     *  - Attribue CONFIRMED ou WAITING selon le score
     *  - Configure le paiement si nécessaire
     */
    private void applyYesLogic(EventParticipation participation, Event event) {
        // Compter les CONFIRMED actuels
        long confirmedCount = participationRepository
                .countByEventIdAndParticipationStatus(event, ParticipationStatus.CONFIRMED);

        // Places disponibles ?
        boolean hasPlace = event.getMaxParticipants() == null ||
                confirmedCount < event.getMaxParticipants();

        if (hasPlace) {
            participation.setParticipationStatus(ParticipationStatus.CONFIRMED);
        } else {
            participation.setParticipationStatus(ParticipationStatus.WAITING);
        }

        // Configuration du paiement
        if (Boolean.TRUE.equals(event.getIsPaid())) {
            participation.setPaymentStatus(PaymentStatus.PENDING);
            participation.setPaymentDeadline(
                    LocalDateTime.now().plusHours(event.getPaymentDeadlineHours())
            );
        } else {
            participation.setPaymentStatus(PaymentStatus.NOT_REQUIRED);
        }
    }

    /**
     * Promeut le premier joueur WAITING vers CONFIRMED.
     * Priorité : meilleur attendanceScore en premier.
     */
    private void promoteNextWaiting(Event event) {
        List<EventParticipation> waitingList =
                participationRepository.findByEventIdAndParticipationStatusOrderByAttendanceScoreDesc(
                        event, ParticipationStatus.WAITING);

        if (!waitingList.isEmpty()) {
            EventParticipation next = waitingList.get(0);
            next.setParticipationStatus(ParticipationStatus.CONFIRMED);
            // TODO : envoyer une notification au joueur promu
            participationRepository.save(next);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  3. PAIEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Confirme le paiement d'un joueur après validation Flouci.
     */
    public EventParticipation confirmPayment(Event event, User user) {
        EventParticipation participation = participationRepository
                .findByEventIdAndUserId(event, user)
                .orElseThrow(() -> new RuntimeException("Participation introuvable"));

        if (participation.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Le paiement n'est pas en attente.");
        }

        // Délai dépassé ?
        if (LocalDateTime.now().isAfter(participation.getPaymentDeadline())) {
            participation.setPaymentStatus(PaymentStatus.EXPIRED);
            participation.setParticipationStatus(ParticipationStatus.WAITING);
            participationRepository.save(participation);
            promoteNextWaiting(event);
            throw new IllegalStateException("Le délai de paiement est dépassé.");
        }

        participation.setPaymentStatus(PaymentStatus.PAID);
        return participationRepository.save(participation);
    }

    /**
     * Expire les paiements dépassés.
     * À appeler via un scheduler toutes les heures.
     */
    public void expireOverduePayments() {
        List<EventParticipation> overduePayments =
                participationRepository.findByPaymentStatusAndPaymentDeadlineBefore(
                        PaymentStatus.PENDING, LocalDateTime.now());

        overduePayments.forEach(p -> {
            p.setPaymentStatus(PaymentStatus.EXPIRED);
            p.setParticipationStatus(ParticipationStatus.WAITING);
            participationRepository.save(p);
            // Libérer la place → promouvoir le prochain WAITING
            promoteNextWaiting(p.getEventId()); // ✅ retourne l'objet Event directement
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //  4. VALIDATION DES PRÉSENCES + SCORE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Le capitaine valide la présence réelle d'un joueur après l'événement.
     *
     * Règles :
     *  - L'événement doit être COMPLETED
     *  - Présent   → score + 5 points (plafonné à 100)
     *  - Absent    → score - 10 points (plancher à 0) + statut ABSENT
     *
     * US-031
     */
    public EventParticipation validatePresence(Event event, User user, Boolean isPresent) {
        if (event.getStatus() != EventStatus.COMPLETED) {
            throw new IllegalStateException("Les présences ne peuvent être validées que sur un événement COMPLETED.");
        }

        EventParticipation participation = participationRepository
                .findByEventIdAndUserId(event, user)
                .orElseThrow(() -> new RuntimeException("Participation introuvable."));

        participation.setIsPresent(isPresent);

        if (Boolean.TRUE.equals(isPresent)) {
            // Présent → +5 points, plafonné à 100
            int newScore = Math.min(100, participation.getAttendanceScore() + 5);
            participation.setAttendanceScore(newScore);
        } else {
            // Absent → statut ABSENT + -10 points, plancher à 0
            participation.setParticipationStatus(ParticipationStatus.ABSENT);
            int newScore = Math.max(0, participation.getAttendanceScore() - 10);
            participation.setAttendanceScore(newScore);
        }

        return participationRepository.save(participation);
    }

    /**
     * Retourne toutes les participations d'un événement.
     * US-031
     */
    public List<EventParticipation> getParticipations(Event event) {
        return participationRepository.findByEventId(event);
    }

    // ═══════════════════════════════════════════════════════════════
    //  5. STATS ASSIDUITÉ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Calcule le taux de présence réelle d'un joueur.
     * Formule : (présences confirmées / total participations) × 100
     * US-037
     */
    public double getAttendanceRate(User user) {
        List<EventParticipation> allParticipations =
                participationRepository.findByUserId(user);

        if (allParticipations.isEmpty()) return 0.0;

        long presentCount = allParticipations.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsPresent()))
                .count();

        return (double) presentCount / allParticipations.size() * 100;
    }
}