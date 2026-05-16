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

@Document(collection = "equipments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {

    @Id
    private String equipmentId;

    @Indexed
    private String sellerId;

    @TextIndexed
    private String name;

    @TextIndexed
    private String description;

    private BigDecimal price;
    private BigDecimal rentalPricePerDay;

    @Indexed
    private String category;

    @Indexed
    private String sport;

    private String brand;
    private String condition;     // NEW / USED / REFURBISHED
    private String listingType;   // SALE / RENT / BOTH

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private List<String> videos = new ArrayList<>();

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private String city;
    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Integer quantity = 1;

    @Builder.Default
    private Long views = 0L;

    @Indexed
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE / SOLD / RESERVED / INACTIVE

    private BigDecimal aiEstimatedPrice;
    private Double aiFraudScore;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer reviewCount = 0;

    @Builder.Default
    private Boolean deleted = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
