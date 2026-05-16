package com.example.coplaybackend.DTOs.Coaching;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InjuryRequest {
    private String bodyPart;
    private String type;
    private String severity;
    private LocalDate dateOccurred;
    private LocalDate expectedRecovery;
    private String status;
    private String notes;
    private String recoveryPlan;
}
