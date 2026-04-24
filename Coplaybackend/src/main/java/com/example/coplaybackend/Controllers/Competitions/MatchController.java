package com.example.coplaybackend.Controllers.Competitions;

import com.example.coplaybackend.Entities.Competitions.MatchCompetition;
import com.example.coplaybackend.Services.Competitions.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200") // Indispensable pour ton Angular
public class MatchController {

    private final MatchService matchService;

    /**
     * Met à jour le score d'un match.
     * Utilise .build() car le service renvoie void.
     */
    @PutMapping("/{id}/score")
    public ResponseEntity<Void> updateMatchScore(
            @PathVariable String id,
            @RequestParam int scoreA,
            @RequestParam int scoreB) {
        matchService.updateMatchScore(id, scoreA, scoreB);
        return ResponseEntity.ok().build();
    }

    /**
     * Récupère les événements (buts, cartons) d'un match.
     * Utilise .build() car le service renvoie void pour le moment.
     */
    @GetMapping("/{id}/events")
    public ResponseEntity<Void> getMatchEvents(@PathVariable String id) {
        matchService.getMatchEvents(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Récupère la liste des matchs pour Angular.
     */
    @GetMapping("/competition/{competitionId}")
    public ResponseEntity<List<MatchCompetition>> getMatchesByCompetition(@PathVariable String competitionId) {
        List<MatchCompetition> matches = matchService.getMatchesByCompetition(competitionId);
        return ResponseEntity.ok(matches);
    }
}