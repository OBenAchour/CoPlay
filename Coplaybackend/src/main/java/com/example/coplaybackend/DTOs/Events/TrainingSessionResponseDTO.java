package com.example.coplaybackend.DTOs.Events;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Events.EventStatus;
import com.example.coplaybackend.Entities.Events.Location;
import com.example.coplaybackend.Entities.Events.TrainingProgram;
import com.example.coplaybackend.Entities.Teams.Team;
import lombok.*;

import java.time.LocalDateTime;

/**
 * TrainingSessionResponseDTO — réponse retournée au frontend.
 *
 * Contient les objets complets pour éviter au frontend
 * de faire des appels API supplémentaires.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingSessionResponseDTO {

    private String sessionId;
    private String title;
    private String description;
    private LocalDateTime sessionDate;
    private Integer duration;

    private Team team;                  // objet complet
    private Location location;          // objet complet
    private User createdBy;             // objet complet
    private TrainingProgram program;    // objet complet (nullable)

    private EventStatus status;
    private Boolean isOfficial;
}