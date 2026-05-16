package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.ReviewRequest;
import com.example.coplaybackend.Entities.Marketplace.Review;
import com.example.coplaybackend.Services.Marketplace.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> create(@RequestBody ReviewRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.create(req));
    }

    @GetMapping
    public ResponseEntity<List<Review>> list(@RequestParam String targetId, @RequestParam String targetType) {
        return ResponseEntity.ok(reviewService.listByTarget(targetId, targetType));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        reviewService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/helpful")
    public ResponseEntity<Review> helpful(@PathVariable String id) {
        return ResponseEntity.ok(reviewService.markHelpful(id));
    }
}
