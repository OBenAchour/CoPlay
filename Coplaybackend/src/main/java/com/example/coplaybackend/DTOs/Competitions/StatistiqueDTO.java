package com.example.coplaybackend.DTOs.Competitions;

import lombok.Data;

@Data
public class StatistiqueDTO {
    private String teamName;
    private int goalsScored;
    private int goalsConceded;
    private int matchesPlayed;
    private int points;
}
