package com.example.coplaybackend.Entities.Teams;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "coaching_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachingSession {

    @Id
    private String sessionId;

    private String coachId;          // ref → User
    private String athleteId;        // ref → User
    private String programId;        // ref → TrainingProgram (nullable)
    private String linkedServiceId;  // ref → MarketplaceService (nullable, set when session bought)

    private LocalDateTime scheduledAt;
    private Integer duration;        // minutes

    private SessionStatus status;

    private String notes;

    private LocalDateTime createdAt;
}
