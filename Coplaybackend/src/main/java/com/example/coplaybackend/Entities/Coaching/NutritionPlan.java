package com.example.coplaybackend.Entities.Coaching;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "nutrition_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionPlan {

    @Id
    private String planId;

    @Indexed
    private String userId;

    private String objective;            // FAT_LOSS / MUSCLE_GAIN / MAINTENANCE / PERFORMANCE

    private Integer dailyCalories;
    private Integer proteinsG;
    private Integer carbsG;
    private Integer fatsG;
    private Integer hydrationGoalMl;

    @Builder.Default
    private List<Meal> meals = new ArrayList<>();

    @Builder.Default
    private Boolean aiGenerated = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Meal {
        private String name;             // breakfast/lunch/dinner/snack
        private String description;
        private Integer calories;
        private List<String> ingredients;
    }
}
