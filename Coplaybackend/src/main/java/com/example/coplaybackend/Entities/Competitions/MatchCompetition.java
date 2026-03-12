package com.example.coplaybackend.Entities.Competitions;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "match_competitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchCompetition {

    @Id
    private String id;

    private String competitionId;    // ref → Competition

    private String teamAId;          // ref → Team

    private String teamBId;          // ref → Team

    private LocalDate dateMatch;

    private Integer scoreTeamA;

    private Integer scoreTeamB;

    private MatchStatus status;

    private Boolean isValidated = false;

    private String validatedBy;      // ref → User

    private LocalDateTime validatedAt;
}