package com.example.coplaybackend.DTOs.Events;

import lombok.*;
import java.time.LocalDateTime;

/**
 * EventRequestDTO — ce que le frontend envoie au backend.
 *
 * Pourquoi un DTO ?
 *  - Le frontend envoie juste des IDs (teamId, locationId)
 *  - Pas besoin d'envoyer les objets complets Team et Location
 *  - Swagger affiche un body simple et clair
 *
 * Ce DTO est utilisé pour :
 *  - POST /api/events/add    (créer)
 *  - PUT  /api/events/update (modifier)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRequestDTO {

    private String teamId;               // ID de l'équipe → String simple
    private String title;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String locationId;           // ID de la location → String simple
    private Boolean isPublic;
    private Integer maxParticipants;
    private Boolean isPaid;
    private Double registrationFee;      // montant en DT
    private Integer paymentDeadlineHours;
}