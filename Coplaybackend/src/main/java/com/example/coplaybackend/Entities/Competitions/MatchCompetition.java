package com.example.coplaybackend.Entities.Competitions;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "match_competitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchCompetition {
    @Id
    private String id;

    @DBRef
    private Competition competition;

    @DBRef
    private Team equipeA;

    @DBRef
    private Team equipeB;

    // --- AJOUT CORRECTIF ---
    private Integer numeroJournee;
    // -----------------------

    private LocalDate dateMatch;
    private Integer scoreA;
    private Integer scoreB;
    private MatchStatus status;
    private Boolean isValidated = false;

    @DBRef
    private User validatedBy;
    private LocalDateTime validatedAt;
    private Integer penaltyScoreA;
    private Integer penaltyScoreB;

    @DBRef
    private User manOfTheMatch;

    @DBRef
    private List<MatchEvent> events;
}