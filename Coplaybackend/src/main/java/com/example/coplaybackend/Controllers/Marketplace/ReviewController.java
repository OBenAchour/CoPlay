package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Review;
import com.example.coplaybackend.Services.Marketplace.ReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Review-controller",
     description = "Avis sur équipements, services, et coachs (targetType=EQUIPMENT|SERVICE|COACH)")
public class ReviewController {

    private final ReviewService service;

    @PostMapping
    public Review create(@RequestParam String authorId,
                         @RequestParam String targetId,
                         @RequestParam String targetType,
                         @RequestParam Integer rating,
                         @RequestParam(required = false) String comment) {
        return service.create(authorId, targetId, targetType, rating, comment);
    }

    @GetMapping
    public List<Review> list(@RequestParam String targetId,
                             @RequestParam String targetType) {
        return service.listForTarget(targetId, targetType);
    }

    @GetMapping("/average")
    public double average(@RequestParam String targetId,
                          @RequestParam String targetType) {
        return service.getAverageRating(targetId, targetType);
    }

    @GetMapping("/coach/{coachId}/average")
    public double coachAverage(@PathVariable String coachId) {
        return service.getAverageRatingForCoach(coachId);
    }
}
