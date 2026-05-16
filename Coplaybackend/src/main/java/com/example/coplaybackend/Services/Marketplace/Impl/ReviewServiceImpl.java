package com.example.coplaybackend.Services.Marketplace.Impl;

import com.example.coplaybackend.Entities.Marketplace.Review;
import com.example.coplaybackend.Repositories.Marketplace.ReviewRepository;
import com.example.coplaybackend.Services.Marketplace.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository repository;

    @Override
    public Review create(String authorId, String targetId, String targetType, Integer rating, String comment) {
        if (!VALID_TARGET_TYPES.contains(targetType)) {
            throw new IllegalArgumentException("Invalid review targetType: " + targetType);
        }
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }

        Review review = Review.builder()
                .authorId(authorId)
                .targetId(targetId)
                .targetType(targetType)
                .rating(rating)
                .comment(comment)
                .createdAt(LocalDateTime.now())
                .build();

        return repository.save(review);
    }

    @Override
    public List<Review> listForTarget(String targetId, String targetType) {
        return repository.findByTargetIdAndTargetType(targetId, targetType);
    }

    @Override
    public double getAverageRating(String targetId, String targetType) {
        return repository.findByTargetIdAndTargetType(targetId, targetType).stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0d);
    }

    @Override
    public double getAverageRatingForCoach(String coachId) {
        return getAverageRating(coachId, "COACH");
    }
}
