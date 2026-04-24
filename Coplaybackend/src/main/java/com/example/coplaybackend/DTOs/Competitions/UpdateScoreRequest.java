package com.example.coplaybackend.DTOs.Competitions;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateScoreRequest {

    @NotNull(message = "Le score A est requis")
    private Integer scoreA;

    @NotNull(message = "Le score B est requis")
    private Integer scoreB;

    private Integer penaltyScoreA;

    private Integer penaltyScoreB;

    @NotBlank(message = "L'ID du validateur est requis")
    private String validatedBy;

    private String manOfTheMatchId;
}
