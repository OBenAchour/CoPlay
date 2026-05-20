package com.example.coplaybackend.Entities.Events;

import com.example.coplaybackend.Entities.Teams.Team;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/**
 * TrainingProgram — programme d'entraînement réutilisable.
 *
 * Concept :
 *  Une "fiche" qui décrit un type d'entraînement (ex: "Cardio débutant - 45min").
 *  Peut être appliquée à plusieurs séances (TrainingSession).
 *
 * Architecture :
 *  - exercises est EMBEDDED (stocké directement dans le document)
 *  - teamId est un objet Team complet (cohérence avec Event)
 *
 * Permissions :
 *  - CRUD réservé à ADMIN global ou COACH de l'équipe
 *
 * US-049 / US-050 / US-051
 */
@Document(collection = "training_programs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingProgram {

    @Id
    private String programId;

    private Team teamId;             // ref → Team (objet complet)

    private String coachId;        // ref → User (auteur du programme)

    private String title;

    private String level;            // BEGINNER | INTERMEDIATE | ADVANCED | PROFESSIONAL

    private Integer duration;        // durée totale en minutes

    // Composition → Exercise est embedded directement
    @DBRef
    private List<Exercise> exercises;

    private List<String> recommendedEquipmentIds;   // ref → Marketplace.Equipment
}
