package com.example.coplaybackend.Entities.Marketplace;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    private String reviewId;

    private String authorId;         // ref → User

    private String targetId;         // ref → Equipment, MarketplaceService, or User (coach)

    private String targetType;       // "EQUIPMENT", "SERVICE", "COACH"

    private Integer rating;          // 1 à 5

    private String comment;

    private LocalDateTime createdAt;
}
