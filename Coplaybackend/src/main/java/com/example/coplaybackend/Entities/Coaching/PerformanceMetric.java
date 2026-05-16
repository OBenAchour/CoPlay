package com.example.coplaybackend.Entities.Coaching;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "performance_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceMetric {

    @Id
    private String metricId;

    @Indexed
    private String userId;

    private LocalDate date;

    private Double sessionLoad;       // RPE * minutes
    private Integer minutes;
    private Integer rpe;              // 1..10
    private Double distanceKm;
    private Double avgSpeedKmh;
    private Integer caloriesBurned;
    private String activity;
}
