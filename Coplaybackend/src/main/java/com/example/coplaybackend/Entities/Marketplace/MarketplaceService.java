package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "marketplace_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceService {

    @Id
    private String serviceId;

    @Indexed
    private String providerId;

    @TextIndexed
    private String name;

    @TextIndexed
    private String description;

    private BigDecimal price;
    private String pricingModel;       // HOURLY / FIXED / PER_EVENT

    @Indexed
    private String category;           // REFEREE / PHYSIO / PHOTOGRAPHER / COACH / OTHER

    @Indexed
    private String sport;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private List<String> certifications = new ArrayList<>();

    @Builder.Default
    private List<TimeSlot> availability = new ArrayList<>();

    private Double radiusKm;
    private String city;
    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer reviewCount = 0;

    @Builder.Default
    private String status = "ACTIVE";  // ACTIVE / PAUSED / INACTIVE

    @Builder.Default
    private Boolean deleted = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimeSlot {
        private String dayOfWeek;       // MON, TUE, ...
        private String startTime;       // "09:00"
        private String endTime;         // "17:00"
    }
}
