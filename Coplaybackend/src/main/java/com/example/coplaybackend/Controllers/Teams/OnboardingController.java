package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.OnboardingMessage.MessageEntry;
import com.example.coplaybackend.Services.Teams.OnboardingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams/{teamId}/onboarding")
@RequiredArgsConstructor
@Tag(name = "Onboarding-controller", description = "Assistant IA d'onboarding pour les nouveaux membres")
@CrossOrigin(origins = "http://localhost:4200")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(
            @PathVariable String teamId,
            @RequestParam String userId,
            @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(onboardingService.chat(teamId, userId, body.get("message")));
        } catch (Exception e) {
            System.err.println("=== CHAT ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<MessageEntry>> getHistory(
            @PathVariable String teamId,
            @RequestParam String userId) {
        return ResponseEntity.ok(onboardingService.getHistory(teamId, userId));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory(
            @PathVariable String teamId,
            @RequestParam String userId) {
        onboardingService.clearHistory(teamId, userId);
        return ResponseEntity.noContent().build();
    }
}