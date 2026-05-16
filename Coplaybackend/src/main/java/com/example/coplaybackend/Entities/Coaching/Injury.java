package com.example.coplaybackend.Entities.Coaching;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
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

    @Indexed
    private String userId;

    private String bodyPart;
    private String type;             // SPRAIN, FRACTURE, STRAIN, ...
    private String severity;         // MINOR / MODERATE / SEVERE

    private LocalDate dateOccurred;
    private LocalDate expectedRecovery;

    @Indexed
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE / HEALING / RECOVERED

    private String notes;
    private String medicalDocUrl;
    private String recoveryPlan;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
