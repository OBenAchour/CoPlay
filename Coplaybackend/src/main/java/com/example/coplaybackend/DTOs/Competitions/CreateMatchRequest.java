package com.example.coplaybackend.DTOs.Competitions;

import com.example.coplaybackend.Entities.Competitions.Enums.MatchPhase;
import com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateMatchRequest {

    @NotBlank(message = "L'ID de la compétition est requis")
    private String competitionId;

    @NotBlank(message = "L'ID de l'équipe A est requis")
    private String equipeAId;

    @NotBlank(message = "L'ID de l'équipe B est requis")
    private String equipeBId;

    private LocalDate dateMatch;

    private MatchPhase phase;
}
