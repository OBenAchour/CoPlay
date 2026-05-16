package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    private String reviewId;

    @Indexed
    private String authorId;

    @Indexed
    private String targetId;

    @Indexed
    private String targetType;       // EQUIPMENT / SERVICE / COACH

    private Integer rating;          // 1..5

    private String comment;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private Integer helpfulVotes = 0;

    @Builder.Default
    private List<String> votedUserIds = new ArrayList<>();

    @Builder.Default
    private Boolean verifiedPurchase = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
