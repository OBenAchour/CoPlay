package com.example.coplaybackend.Entities.Events;

import lombok.*;

/**
 * Exercise — entité EMBEDDED dans TrainingProgram.
 *
 * Pas de @Document : un exercice n'a pas d'existence propre,
 * il vit toujours à l'intérieur d'un TrainingProgram.
 * MongoDB stocke les exercices directement dans le document parent.
 *
 * exerciseId : UUID généré côté Service pour cibler un exercice
 * précis dans la liste lors d'un update/delete.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {

    private String exerciseId;

    private String name;

    private String description;

    private String videoUrl;
}