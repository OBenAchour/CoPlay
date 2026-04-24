package com.example.coplaybackend.DTOs.Competitions;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalTime;

@Data
public class AddMatchEventRequest {

    @NotBlank(message = "L'ID du joueur est requis")
    private String playerId;

    @NotBlank(message = "Le type d'événement est requis")
    private String type;

    private Integer minute;

    private LocalTime time;

    private String description;

    private String teamId;
}
