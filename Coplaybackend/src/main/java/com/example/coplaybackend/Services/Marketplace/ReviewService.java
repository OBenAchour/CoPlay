package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.ReviewRequest;
import com.example.coplaybackend.Entities.Marketplace.Booking;
import com.example.coplaybackend.Entities.Marketplace.Review;
import com.example.coplaybackend.Repositories.Marketplace.BookingRepository;
import com.example.coplaybackend.Repositories.Marketplace.OrderRepository;
import com.example.coplaybackend.Repositories.Marketplace.ReviewRepository;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;
    private final EquipmentService equipmentService;
    private final ProviderServiceService providerServiceService;

    public Review create(ReviewRequest req) {
        String userId = SecurityUtils.getCurrentUserId();

        if (reviewRepository.existsByAuthorIdAndTargetIdAndTargetType(userId, req.getTargetId(), req.getTargetType())) {
            throw new RuntimeException("Vous avez déjà laissé un avis pour cet élément.");
        }

        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new RuntimeException("La note doit être entre 1 et 5.");
        }

        boolean verified = isVerifiedPurchase(userId, req.getTargetId(), req.getTargetType());

        Review r = Review.builder()
                .authorId(userId)
                .targetId(req.getTargetId())
                .targetType(req.getTargetType())
                .rating(req.getRating())
                .comment(req.getComment())
                .images(req.getImages() != null ? req.getImages() : new ArrayList<>())
                .verifiedPurchase(verified)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Review saved = reviewRepository.save(r);
        recomputeRating(req.getTargetId(), req.getTargetType());
        return saved;
    }

    public List<Review> listByTarget(String targetId, String targetType) {
        return reviewRepository.findByTargetIdAndTargetType(targetId, targetType);
    }

    public void delete(String reviewId) {
        Review r = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Avis introuvable"));
        String me = SecurityUtils.getCurrentUserId();
        if (!Objects.equals(me, r.getAuthorId())) {
            throw new RuntimeException("Action interdite");
        }
        reviewRepository.deleteById(reviewId);
        recomputeRating(r.getTargetId(), r.getTargetType());
    }

    public Review markHelpful(String reviewId) {
        Review r = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Avis introuvable"));
        String me = SecurityUtils.getCurrentUserId();
        if (r.getVotedUserIds().contains(me)) {
            throw new RuntimeException("Vote déjà enregistré");
        }
        r.getVotedUserIds().add(me);
        r.setHelpfulVotes(r.getVotedUserIds().size());
        return reviewRepository.save(r);
    }

    private boolean isVerifiedPurchase(String userId, String targetId, String targetType) {
        if ("EQUIPMENT".equals(targetType)) {
            return !orderRepository.findPaidByBuyerAndTarget(userId, targetId).isEmpty();
        }
        if ("SERVICE".equals(targetType) || "COACH".equals(targetType)) {
            return bookingRepository.findByClientIdAndTargetIdAndStatus(userId, targetId, "COMPLETED")
                    .stream().anyMatch(b -> b != null);
        }
        return false;
    }

    private void recomputeRating(String targetId, String targetType) {
        List<Review> all = reviewRepository.findByTargetIdAndTargetType(targetId, targetType);
        double avg = all.isEmpty() ? 0.0 : all.stream().mapToInt(Review::getRating).average().orElse(0.0);
        int count = all.size();
        if ("EQUIPMENT".equals(targetType)) {
            equipmentService.recomputeRating(targetId, avg, count);
        } else if ("SERVICE".equals(targetType) || "COACH".equals(targetType)) {
            try { providerServiceService.recomputeRating(targetId, avg, count); }
            catch (Exception ignored) {}
        }
    }
}
