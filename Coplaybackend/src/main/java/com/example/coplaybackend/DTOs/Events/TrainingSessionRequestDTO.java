package com.example.coplaybackend.DTOs.Events;

import lombok.*;
import java.time.LocalDateTime;

/**
 * TrainingSessionRequestDTO — body envoyé par le frontend.
 *
 * Le frontend envoie des IDs simples (String).
 * Le backend (Service) charge les objets complets depuis MongoDB.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingSessionRequestDTO {

    private String title;
    private String description;
    private LocalDateTime sessionDate;
    private Integer duration;          // en minutes

    private String teamId;             // ID de l'équipe
    private String locationId;         // ID du lieu
    private String createdById;        // ID de l'utilisateur créateur
    private String programId;          // ID du programme (nullable = séance libre)
}