package com.example.coplaybackend.DTOs.Coaching;

import lombok.Data;

import java.util.List;

@Data
public class NutritionAIRequest {
    private String objective;
    private Double weightKg;
    private Double heightCm;
    private Integer age;
    private String sex;
    private String activityLevel;       // LOW / MEDIUM / HIGH
    private List<String> allergies;
}
