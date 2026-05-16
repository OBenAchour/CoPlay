package com.example.coplaybackend.Controllers.Competitions;

import com.example.coplaybackend.Entities.Competitions.MatchCompetition;
import com.example.coplaybackend.Services.Competitions.MatchService;
import lombok.Data; // Import pour le DTO
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class MatchController {

    private final MatchService matchService;

    // --- CORRECTION : Utilisation de RequestBody pour correspondre à Angular ---
    @PutMapping("/{id}/score")
    public ResponseEntity<Void> updateMatchScore(
            @PathVariable String id,
            @RequestBody ScoreRequest request) { // On reçoit le JSON d'Angular ici
        matchService.updateMatchScore(id, request.getScoreA(), request.getScoreB());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<Void> getMatchEvents(@PathVariable String id) {
        matchService.getMatchEvents(id); // La méthode est ajoutée dans le Service ci-dessous
        return ResponseEntity.ok().build();
    }

    @GetMapping("/competition/{competitionId}")
    public ResponseEntity<List<MatchCompetition>> getMatchesByCompetition(@PathVariable String competitionId) {
        List<MatchCompetition> matches = matchService.getMatchesByCompetition(competitionId);
        return ResponseEntity.ok(matches);
    }

    // Un petit DTO interne pour lire le JSON envoyé par Angular
    @Data
    public static class ScoreRequest {
        private int scoreA;
        private int scoreB;
    }
}