package com.example.coplaybackend.Entities.Events;

import com.example.coplaybackend.Entities.Teams.Team;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
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

    @DBRef
    private Team teamId;           // ref → Team

    private String title;

    private String level;

    private Integer duration;        // en minutes

    // Composition → Exercise est embedded directement
    @DBRef
    private List<Exercise> exercises;
}
