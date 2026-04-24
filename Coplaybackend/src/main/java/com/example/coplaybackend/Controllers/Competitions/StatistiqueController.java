package com.example.coplaybackend.Controllers.Competitions;

import com.example.coplaybackend.Entities.Competitions.ResultatTournoi;
import com.example.coplaybackend.Entities.Competitions.StatistiqueEquipe;
import com.example.coplaybackend.Entities.Competitions.StatistiqueJoueur;
import com.example.coplaybackend.Repositories.Competitions.ResultatTournoiRepository;
import com.example.coplaybackend.Repositories.Competitions.StatistiqueEquipeRepository;
import com.example.coplaybackend.Services.Competitions.ClassementService;
import com.example.coplaybackend.Services.Competitions.StatistiqueJoueurService;
import com.example.coplaybackend.Services.Competitions.TournoiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistiques")
@RequiredArgsConstructor
public class StatistiqueController {

    private final StatistiqueEquipeRepository statEquipeRepo;
    private final StatistiqueJoueurService joueurService;
    private final ClassementService classementService;
    private final TournoiService tournoiService;
    private final ResultatTournoiRepository resultatRepo;

    @GetMapping("/competition/{id}/classement")
    public ResponseEntity<List<ClassementService.ClassementDTO>> getCompetitionClassement(
            @PathVariable String id) {
        return ResponseEntity.ok(classementService.getClassementWithDetails(id));
    }

    @GetMapping("/equipe/{equipeId}")
    public ResponseEntity<List<StatistiqueEquipe>> getEquipeStats(
            @PathVariable String equipeId) {
        return ResponseEntity.ok(statEquipeRepo.findAll().stream()
                .filter(s -> s.getEquipe() != null && s.getEquipe().getTeamId().equals(equipeId))
                .toList());
    }

    @GetMapping("/equipe/{equipeId}/competition/{competitionId}")
    public ResponseEntity<ClassementService.ClassementDTO> getEquipeStatsForCompetition(
            @PathVariable String equipeId,
            @PathVariable String competitionId) {
        return ResponseEntity.ok(classementService.getEquipeDetails(equipeId, competitionId));
    }

    @GetMapping("/competition/{id}/top-scorers")
    public ResponseEntity<List<StatistiqueJoueur>> getTopScorers(@PathVariable String id) {
        return ResponseEntity.ok(joueurService.getTopScorers(id));
    }

    @GetMapping("/competition/{id}/top-passers")
    public ResponseEntity<List<StatistiqueJoueur>> getTopPassers(@PathVariable String id) {
        return ResponseEntity.ok(joueurService.getTopPassers(id));
    }

    @GetMapping("/competition/{id}/best-goalkeepers")
    public ResponseEntity<List<StatistiqueJoueur>> getBestGoalkeepers(@PathVariable String id) {
        return ResponseEntity.ok(joueurService.getBestGoalkeepers(id));
    }

    @GetMapping("/competition/{id}/best-players")
    public ResponseEntity<List<StatistiqueJoueur>> getBestPlayers(@PathVariable String id) {
        return ResponseEntity.ok(joueurService.getBestPlayers(id));
    }

    @GetMapping("/competition/{id}/top-stars")
    public ResponseEntity<List<StatistiqueJoueur>> getTopStars(@PathVariable String id) {
        return ResponseEntity.ok(joueurService.getTopStars(id));
    }

    @GetMapping("/competition/{id}/journee")
    public ResponseEntity<?> getCurrentJournee(@PathVariable String id) {
        return ResponseEntity.ok(Map.of(
                "competitionId", id,
                "currentJournee", classementService.getCurrentJournee(id)
        ));
    }

    @GetMapping("/joueur/{playerId}/competition/{competitionId}")
    public ResponseEntity<StatistiqueJoueur> getPlayerStats(
            @PathVariable String playerId,
            @PathVariable String competitionId) {
        StatistiqueJoueur stats = joueurService.getPlayerStats(playerId, competitionId);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/competition/{id}/tournoi/classement")
    public ResponseEntity<List<ResultatTournoi>> getTournoiClassement(@PathVariable String id) {
        return ResponseEntity.ok(tournoiService.getClassementTournoi(id));
    }

    @GetMapping("/competition/{id}/extras")
    public ResponseEntity<Map<String, Object>> getExtraStats(@PathVariable String id) {
        List<StatistiqueJoueur> topScorers = joueurService.getTopScorers(id);
        List<StatistiqueJoueur> bestPlayers = joueurService.getBestPlayers(id);
        List<StatistiqueJoueur> topStars = joueurService.getTopStars(id);
        List<StatistiqueJoueur> bestGoalkeepers = joueurService.getBestGoalkeepers(id);

        return ResponseEntity.ok(Map.of(
                "meilleurButeur", topScorers.isEmpty() ? null : topScorers.get(0),
                "meilleurJoueur", bestPlayers.isEmpty() ? null : bestPlayers.get(0),
                "etoileStar", topStars.isEmpty() ? null : topStars.get(0),
                "meilleurGardien", bestGoalkeepers.isEmpty() ? null : bestGoalkeepers.get(0),
                "top5Buteurs", topScorers.stream().limit(5).toList(),
                "top5Joueurs", bestPlayers.stream().limit(5).toList()
        ));
    }
}
