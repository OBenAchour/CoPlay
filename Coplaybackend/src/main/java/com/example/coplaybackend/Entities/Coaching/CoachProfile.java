package com.example.coplaybackend.Entities.Coaching;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "coach_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachProfile {

    @Id
    private String coachProfileId;

    @Indexed(unique = true)
    private String userId;

    private String bio;

    @Builder.Default
    private List<String> specialties = new ArrayList<>();

    @Builder.Default
    private List<Certification> certifications = new ArrayList<>();

    private Integer yearsExperience;
    private BigDecimal hourlyRate;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer reviewCount = 0;

    @Builder.Default
    private Boolean verified = false;

    @Builder.Default
    private List<Availability> availability = new ArrayList<>();

    private String city;
    private Double latitude;
    private Double longitude;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Certification {
        private String name;
        private String issuer;
        private Integer year;
        private String documentUrl;
        @Builder.Default
        private Boolean verified = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Availability {
        private String dayOfWeek;
        private String startTime;
        private String endTime;
    }
}
