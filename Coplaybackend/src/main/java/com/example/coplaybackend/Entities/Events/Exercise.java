package com.example.coplaybackend.Entities.Events;

import lombok.*;
import org.springframework.data.annotation.Id;

/**
 * Embedded dans TrainingProgram — pas de collection propre.
 * Stocké directement dans le document training_programs.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {

    @Id
    private String exerciseId;

    private String name;

    private String description;

    private String videoUrl;
}
