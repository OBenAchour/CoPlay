package com.example.coplaybackend.Entities.Teams;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "injuries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Injury {

    @Id
    private String injuryId;

    private String athleteId;            // ref → User
    private String reportedByCoachId;    // ref → User (nullable)

    private String bodyPart;
    private InjurySeverity severity;
    private InjuryStatus status;

    private LocalDate startDate;
    private LocalDate expectedRecovery;

    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
