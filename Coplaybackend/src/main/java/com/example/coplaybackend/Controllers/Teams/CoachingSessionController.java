package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.CoachingSession;
import com.example.coplaybackend.Services.Teams.CoachingSessionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/coaching-sessions")
@RequiredArgsConstructor
@Tag(name = "Coaching-session-controller",
     description = "Planification de sessions coach↔athlète, bloquée si blessure ACTIVE")
public class CoachingSessionController {

    private final CoachingSessionService service;

    @PostMapping
    public CoachingSession schedule(
            @RequestParam String coachId,
            @RequestParam String athleteId,
            @RequestParam(required = false) String programId,
            @RequestParam LocalDateTime scheduledAt,
            @RequestParam(required = false) Integer duration) {

        return service.scheduleSession(coachId, athleteId, programId, scheduledAt, duration);
    }

    @PatchMapping("/{sessionId}/link-service")
    public CoachingSession linkService(@PathVariable String sessionId,
                                       @RequestParam String marketplaceServiceId) {
        return service.linkToMarketplaceService(sessionId, marketplaceServiceId);
    }

    @PatchMapping("/{sessionId}/complete")
    public CoachingSession complete(@PathVariable String sessionId,
                                    @RequestParam(required = false) String notes) {
        return service.markCompleted(sessionId, notes);
    }

    @PatchMapping("/{sessionId}/cancel")
    public CoachingSession cancel(@PathVariable String sessionId) {
        return service.cancel(sessionId);
    }

    @GetMapping("/coach/{coachId}")
    public List<CoachingSession> byCoach(@PathVariable String coachId) {
        return service.getByCoach(coachId);
    }

    @GetMapping("/athlete/{athleteId}")
    public List<CoachingSession> byAthlete(@PathVariable String athleteId) {
        return service.getByAthlete(athleteId);
    }
}
