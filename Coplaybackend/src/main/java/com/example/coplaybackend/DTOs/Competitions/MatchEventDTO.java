package com.example.coplaybackend.DTOs.Competitions;

import lombok.Data;

@Data
public class MatchEventDTO {
    private String eventType; // e.g., GOAL, ASSIST
    private String playerName;
    private int minute;
}
