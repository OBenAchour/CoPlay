package com.example.coplaybackend.DTOs.Competitions;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MatchDTO {
    private String teamA;
    private String teamB;
    private int scoreA;
    private int scoreB;
    private String logoA;
    private String logoB;
    private LocalDateTime date;
    private String events;
}
