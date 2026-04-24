package com.example.coplaybackend.Entities.Events;

import com.example.coplaybackend.Entities.Teams.Team;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;


@Document(collection = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    private String eventId;


    private Team teamId;          // ref → Team (module Teams)

    private String title;


    private LocalDateTime startDate;

    private LocalDateTime endDate;


    private Location locationId;      // ref → Location


    private EventStatus status;     // SCHEDULED | ONGOING | COMPLETED | CANCELLED

    private Boolean isPublic = true;

    // ── Capacité & Liste d'attente ─────────────────────────────────
    /**
     * Nombre maximum de joueurs acceptés dans l'événement.
     * Les joueurs au-delà de cette limite sont mis en WAITING.
     * Priorité donnée aux meilleurs scores de fiabilité.
     */
    private Integer maxParticipants;

    // ── Paiement ───────────────────────────────────────────────────
    /**
     * L'événement est-il payant ?
     * Ex : location de terrain partagée, séance avec coach externe.
     */
    @Builder.Default
    private Boolean isPaid = false;

    /**
     * Montant que chaque joueur doit payer pour participer (en DT).
     * Null si isPaid = false.
     */
    private Double registrationFee;

    /**
     * Délai en heures accordé au joueur pour payer après avoir répondu YES.
     * Défini par le capitaine selon la date de l'événement.
     * Ex : event dans 3 jours → 24h / event dans 2 semaines → 72h.
     * Règle : paymentDeadlineHours ne peut pas dépasser la durée avant l'événement.
     */
    private Integer paymentDeadlineHours;
}