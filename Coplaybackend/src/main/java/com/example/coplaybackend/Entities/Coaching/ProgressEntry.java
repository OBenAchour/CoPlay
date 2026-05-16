package com.example.coplaybackend.Entities.Coaching;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "progress_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressEntry {

    @Id
    private String entryId;

    @Indexed
    private String userId;

    private LocalDate date;

    private Double weightKg;
    private Double bodyFatPct;

    @Builder.Default
    private Map<String, Double> metrics = new HashMap<>();

    private String notes;
}
