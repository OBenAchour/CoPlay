package com.example.coplaybackend.Entities.Coaching;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "coaching_programs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachingProgram {

    @Id
    private String programId;

    @Indexed
    private String coachId;

    @Indexed
    private String clientId;          // user or team

    private String clientType;        // USER / TEAM

    private String title;
    private String description;

    private String objective;         // FITNESS / STRENGTH / ENDURANCE / REHAB / SPORT_SPECIFIC
    private String level;             // BEGINNER / INTERMEDIATE / ADVANCED
    private Integer durationWeeks;

    @Builder.Default
    private Boolean aiGenerated = false;

    @Indexed
    @Builder.Default
    private String status = "DRAFT";   // DRAFT / ACTIVE / COMPLETED / ARCHIVED

    @Builder.Default
    private List<WeekPlan> weeklyPlan = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WeekPlan {
        private Integer weekNumber;
        private String focus;
        @Builder.Default
        private List<DaySession> days = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DaySession {
        private String dayOfWeek;
        private String title;
        @Builder.Default
        private List<ProgramExercise> exercises = new ArrayList<>();
        @Builder.Default
        private Boolean completed = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgramExercise {
        private String exerciseId;     // ref to LibraryExercise
        private String name;
        private Integer sets;
        private Integer reps;
        private Integer durationSec;
        private Integer restSec;
        private String notes;
    }
}
