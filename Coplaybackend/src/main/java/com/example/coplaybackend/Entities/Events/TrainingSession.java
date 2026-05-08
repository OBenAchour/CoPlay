package com.example.coplaybackend.Entities.Events;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Teams.Team;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * TrainingSession — séance d'entraînement planifiée.
 *
 * Concept :
 *  Une séance datée que l'équipe va effectivement faire à un moment donné.
 *  Peut appliquer un TrainingProgram existant (séance officielle)
 *  OU être une séance libre sans programme (initiative joueur).
 *
 * Permissions :
 *  - Séance OFFICIELLE (avec program) : créée par ADMIN ou COACH
 *  - Séance LIBRE (sans program) : créée par n'importe quel membre
 *  - Modification/Annulation : COACH ou créateur
 *
 * Règles métier :
 *  - sessionDate doit être dans le futur à la création
 *  - Statut : SCHEDULED → COMPLETED ou CANCELLED
 */
@Document(collection = "training_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingSession {

    @Id
    private String sessionId;

    private String title;               // ex: "Entraînement du mardi"

    private String description;         // optionnel

    private LocalDateTime sessionDate;  // date et heure de la séance

    private Integer duration;           // durée en minutes

    private Team teamId;                // équipe concernée

    private Location locationId;        // lieu de la séance

    private User createdBy;             // créateur (admin, coach ou joueur)

    private TrainingProgram program;    // programme appliqué (nullable = séance libre)

    private EventStatus status;         // SCHEDULED | COMPLETED | CANCELLED

    @Builder.Default
    private Boolean isOfficial = false; // true si créée avec un program
}