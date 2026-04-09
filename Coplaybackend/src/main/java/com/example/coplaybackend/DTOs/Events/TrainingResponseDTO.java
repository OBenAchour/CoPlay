package com.example.coplaybackend.DTOs.Events;

import com.example.coplaybackend.Entities.Events.Exercise;
import lombok.*;

import java.util.List;

/**
 * TrainingResponseDTO — ce que le backend retourne.
 *
 * Pourquoi les exercises sont inclus ici ?
 *  - La réponse contient le programme complet avec ses exercices
 *  - Le frontend n'a pas besoin de faire un appel supplémentaire
 *  - Chaque modification d'exercice retourne le programme complet mis à jour
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingResponseDTO {

    private String         programId;  // généré par MongoDB
    private String         teamId;
    private String         title;
    private String         level;
    private Integer        duration;
    private List<Exercise> exercises;  // exercices embedded
}