package com.example.coplaybackend.DTOs.Events;

import com.example.coplaybackend.Entities.Events.EventStatus;
import com.example.coplaybackend.Entities.Events.Location;
import com.example.coplaybackend.Entities.Teams.Team;
import lombok.*;
import java.time.LocalDateTime;

/**
 * EventResponseDTO — ce que le backend retourne au frontend.
 *
 * Pourquoi différent du RequestDTO ?
 *  - La réponse contient les objets complets (Team, Location)
 *    au lieu des simples IDs
 *  - Le frontend reçoit toutes les infos sans faire
 *    des appels supplémentaires
 *  - Le statut et l'eventId sont ajoutés (générés par le backend)
 *
 * Ce DTO est utilisé en retour de :
 *  - POST /api/events/add
 *  - PUT  /api/events/update
 *  - GET  /api/events/get/...
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponseDTO {

    private String eventId;              // généré par MongoDB
    private Team team;                   // objet Team complet
    private String title;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Location location;           // objet Location complet
    private EventStatus status;          // SCHEDULED | ONGOING | COMPLETED | CANCELLED
    private Boolean isPublic;
    private Integer maxParticipants;
    private Boolean isPaid;
    private Double registrationFee;
    private Integer paymentDeadlineHours;
}