package com.example.coplaybackend.Entities.Events;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "training_programs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingProgram {

    @Id
    private String programId;

    private String teamId;           // ref → Team

    private String title;

    private String level;

    private Integer duration;        // en minutes

    // Composition → Exercise est embedded directement
    private List<Exercise> exercises;
}
