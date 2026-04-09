package com.example.coplaybackend.DTOs.Events;

import lombok.*;

/**
 * TrainingRequestDTO — ce que le frontend envoie à la création.
 *
 * Pourquoi pas d'exercises ici ?
 *  - Les exercices sont ajoutés séparément via
 *    POST /api/training/exercises/add/{programId}
 *  - À la création, le programme commence toujours vide
 *  - Cela évite d'envoyer un body complexe inutilement
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingRequestDTO {

    private String  teamId;    // ID de l'équipe → String simple
    private String  title;
    private String  level;     // BEGINNER | INTERMEDIATE | ADVANCED | PROFESSIONAL
    private Integer duration;  // en minutes
}