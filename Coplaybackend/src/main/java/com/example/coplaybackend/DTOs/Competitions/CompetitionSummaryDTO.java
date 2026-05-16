package com.example.coplaybackend.DTOs.Competitions;

import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionStatus;
import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompetitionSummaryDTO {
    private String id;
    private String name;
    private String sport;
    private LocalDate startDate;
    private LocalDate endDate;
    private CompetitionStatus status;
    private CompetitionType type;
    private Integer maxTeams;
    private Boolean isDoubleLeg;
    private Integer currentRound;
    private String format;
    private Integer totalRounds;
    private Long countTeams;
}
