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

    @DBRef(lazy = true)
    private Competition competition;

    @DBRef(lazy = true)
    private Team equipeA;

    @DBRef(lazy = true)
    private Team equipeB;

    private Integer numeroJournee;

    private LocalDate dateMatch;
    private Integer scoreA;
    private Integer scoreB;

    private Integer scoreAByCaptainA;
    private Integer scoreBByCaptainA;
    private Integer scoreAByCaptainB;
    private Integer scoreBByCaptainB;

    private MatchStatus status;
    @Builder.Default
    private Boolean isValidated = false;

    @DBRef(lazy = true)
    private User validatedBy;
    private LocalDateTime validatedAt;
    private Integer penaltyScoreA;
    private Integer penaltyScoreB;

    @DBRef(lazy = true)
    private User manOfTheMatch;

    @DBRef(lazy = true)
    private List<MatchEvent> events;

    // --- POSSESSION & VIDEO AI ---
    private Double possessionA;
    private Double possessionB;
    private String videoUrl;

    // --- ADDITIONAL STATS ---
    private Integer shotsA;
    private Integer shotsB;
    private Double passAccuracyA;
    private Double passAccuracyB;
    private Integer foulsA;
    private Integer foulsB;
    private String formationA;
    private String formationB;

    // --- ML ANALYSIS ---
    private String mlSummaryJson;
    private String mlStatus;
    private String mlJobId;
}