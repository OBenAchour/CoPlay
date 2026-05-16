package com.example.coplaybackend.Entities.Coaching;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "library_exercises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryExercise {

    @Id
    private String exerciseId;

    @TextIndexed
    private String name;

    @TextIndexed
    private String description;

    private String videoUrl;
    private String thumbnailUrl;

    @Builder.Default
    private List<String> muscleGroups = new ArrayList<>();

    @Indexed
    private String equipmentNeeded;

    private String difficulty;          // BEGINNER / INTERMEDIATE / ADVANCED
    private String instructions;
    private Double caloriesPerMin;

    @Indexed
    private String createdBy;           // userId of contributing coach

    @Builder.Default
    private Boolean approved = true;
}
