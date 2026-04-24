package com.example.coplaybackend.DTOs.Competitions;

import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateCompetitionRequest {

    @NotBlank(message = "Le nom est requis")
    private String name;

    @NotBlank(message = "Le sport est requis")
    private String sport;

    @NotNull(message = "Le type est requis")
    private CompetitionType type;

    @NotNull(message = "La date de début est requise")
    private LocalDate startDate;

    private LocalDate endDate;

    @Positive(message = "Le nombre max d'équipes doit être positif")
    private Integer maxTeams;

    private List<String> teamIds;

    private Boolean doubleLeg = true;
}
