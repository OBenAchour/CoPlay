package com.example.coplaybackend.Entities.Coaching;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "medical_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord {

    @Id
    private String recordId;

    @Indexed(unique = true)
    private String userId;

    private String bloodType;

    @Builder.Default
    private List<String> allergies = new ArrayList<>();

    @Builder.Default
    private List<String> chronicConditions = new ArrayList<>();

    @Builder.Default
    private List<String> medications = new ArrayList<>();

    private String emergencyContactName;
    private String emergencyContactPhone;

    private LocalDate lastCheckup;

    @Builder.Default
    private List<String> authorizedCoachIds = new ArrayList<>();

    @Builder.Default
    private Boolean consent = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
