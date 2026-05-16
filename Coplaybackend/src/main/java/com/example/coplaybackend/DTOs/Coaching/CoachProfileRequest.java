package com.example.coplaybackend.DTOs.Coaching;

import com.example.coplaybackend.Entities.Coaching.CoachProfile;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CoachProfileRequest {
    private String bio;
    private List<String> specialties;
    private List<CoachProfile.Certification> certifications;
    private Integer yearsExperience;
    private BigDecimal hourlyRate;
    private List<CoachProfile.Availability> availability;
    private String city;
    private Double latitude;
    private Double longitude;
}
