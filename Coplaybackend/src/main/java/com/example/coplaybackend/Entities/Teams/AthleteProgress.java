package com.example.coplaybackend.Entities.Teams;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "athlete_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AthleteProgress {

    @Id
    private String progressId;

    private String athleteId;        // ref → User
    private String programId;        // ref → TrainingProgram
    private String exerciseId;       // ref → Exercise
    private String coachId;          // ref → User (coach who recorded, nullable)

    private ProgressMetric metric;
    private Double value;

    private LocalDateTime recordedAt;
}
