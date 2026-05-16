package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Review;

import java.util.List;
import java.util.Set;

public interface ReviewService {

    /** Valid target types: EQUIPMENT, SERVICE, COACH. */
    Set<String> VALID_TARGET_TYPES = Set.of("EQUIPMENT", "SERVICE", "COACH");

    Review create(String authorId, String targetId, String targetType, Integer rating, String comment);

    List<Review> listForTarget(String targetId, String targetType);

    double getAverageRating(String targetId, String targetType);

    double getAverageRatingForCoach(String coachId);
}
