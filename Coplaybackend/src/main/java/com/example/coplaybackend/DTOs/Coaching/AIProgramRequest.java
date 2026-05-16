package com.example.coplaybackend.DTOs.Coaching;

import lombok.Data;

@Data
public class AIProgramRequest {
    private String clientId;        // optional, defaults to current user
    private String clientType;      // USER / TEAM
    private String objective;
    private String level;
    private Integer durationWeeks;
    private String sport;
}
