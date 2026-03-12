package com.example.coplaybackend.Entities.Teams;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "propositions_coach")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropositionCoach {

    @Id
    private String propositionId;

    private String teamId;           // ref → Team

    private String coachId;          // ref → User

    private StatutDemande statut;

    private LocalDateTime createdAt;
}
