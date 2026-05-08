package com.example.coplaybackend.Controllers.Competitions;

import com.example.coplaybackend.DTOs.Competitions.CreateCompetitionRequest;
import com.example.coplaybackend.Entities.Competitions.*;
import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionStatus;
import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionType;
import com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Repositories.Competitions.CompetitionRepository;
import com.example.coplaybackend.Repositories.Competitions.MatchCompetitionRepository;
import com.example.coplaybackend.Services.Competitions.CalendarService;
import com.example.coplaybackend.Services.Competitions.ClassementService;
import com.example.coplaybackend.Services.Competitions.TournoiService;
import com.example.coplaybackend.Services.Teams.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/competitions")
@RequiredArgsConstructor
public class CompetitionController {

    private final CompetitionRepository competitionRepo;
    private final MatchCompetitionRepository matchRepo;
    private final CalendarService calendarService;
    private final TournoiService tournoiService;
    private final ClassementService classementService;
    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<Competition> createCompetition(@Valid @RequestBody CreateCompetitionRequest request) {
        Competition competition;

        if (request.getType() == CompetitionType.LEAGUE) {
            Ligue ligue = Ligue.builder()
                    .name(request.getName())
                    .sport(request.getSport())
                    .startDate(request.getStartDate())
                    .endDate(request.getEndDate())
                    .maxTeams(request.getMaxTeams())
                    .status(CompetitionStatus.CREATED)
                    .type(CompetitionType.LEAGUE)
                    .pointsPerWin(3)
                    .pointsPerDraw(1)
                    .pointsPerLoss(0)
                    .build();
            competition = competitionRepo.save(ligue);
        } else {
            Tournoi tournoi = Tournoi.builder()
                    .name(request.getName())
                    .sport(request.getSport())
                    .startDate(request.getStartDate())
                    .endDate(request.getEndDate())
                    .maxTeams(request.getMaxTeams())
                    .status(CompetitionStatus.CREATED)
                    .type(CompetitionType.TOURNAMENT)
                    .isDoubleLeg(request.getDoubleLeg())
                    .currentRound(0)
                    .totalRounds(0)
                    .build();
            competition = competitionRepo.save(tournoi);
        }

        return ResponseEntity.ok(competition);
    }

    @PostMapping("/{id}/generate-calendar")
    public ResponseEntity<?> generateCalendar(@PathVariable String id, @RequestParam(required = false) Boolean doubleLeg) {
        Competition competition = competitionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Compétition non trouvée"));

        List<Team> teams = calendarService.getTeamsFilteredBySport(
                competition.getSport(),
                competition.getMaxTeams()
        );

        if (teams.size() < 2) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Pas assez d'équipes de " + competition.getSport() + " trouvées."
            ));
        }

        if (competition.getType() == CompetitionType.LEAGUE) {
            List<Journee> journees = calendarService.generateRoundRobinCalendar(
                    teams,
                    competition.getStartDate(),
                    doubleLeg != null ? doubleLeg : true
            );

            List<MatchCompetition> allMatches = new ArrayList<>();
            for (Journee journee : journees) {
                for (MatchCompetition match : journee.getMatchs()) {
                    match.setCompetition(competition);
                    match.setStatus(MatchStatus.SCHEDULED);
                    // --- FIX CRUCIAL ICI ---
                    match.setNumeroJournee(journee.getNumero());
                    // -----------------------
                    allMatches.add(match);
                }
            }

            matchRepo.saveAll(allMatches);
            competition.setStatus(CompetitionStatus.CALENDAR_GENERATED);
            competitionRepo.save(competition);

            return ResponseEntity.ok(Map.of(
                    "message", "Calendrier généré avec succès pour " + teams.size() + " équipes",
                    "journees", journees.size(),
                    "matchs", allMatches.size()
            ));
        } else {
            Tournoi tournoi = tournoiService.generateTournamentBracket(
                    id,
                    teams,
                    doubleLeg != null ? doubleLeg : true
            );
            return ResponseEntity.ok(Map.of(
                    "message", "Bracket de tournoi généré",
                    "rounds", tournoi.getTotalRounds()
            ));
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startCompetition(@PathVariable String id) {
        Competition competition = competitionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Compétition non trouvée"));

        if (competition.getStatus() != CompetitionStatus.CALENDAR_GENERATED) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "La compétition doit avoir un calendrier généré avant de démarrer"
            ));
        }

        competition.setStatus(CompetitionStatus.IN_PROGRESS);
        competitionRepo.save(competition);

        return ResponseEntity.ok(Map.of("message", "Compétition démarrée"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Competition> getCompetition(@PathVariable String id) {
        return ResponseEntity.ok(competitionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Compétition non trouvée")));
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<MatchCompetition>> getCompetitionMatches(@PathVariable String id) {
        return ResponseEntity.ok(matchRepo.findByCompetitionId(id));
    }

    @GetMapping("/{id}/classement")
    public ResponseEntity<List<ClassementService.ClassementDTO>> getClassement(@PathVariable String id) {
        return ResponseEntity.ok(classementService.getClassementWithDetails(id));
    }

    @GetMapping("/{id}/journee/{numero}")
    public ResponseEntity<List<MatchCompetition>> getJourneeMatches(
            @PathVariable String id, @PathVariable int numero) {
        return ResponseEntity.ok(classementService.getJourneeMatches(id, numero));
    }

    @GetMapping("/league")
    public ResponseEntity<List<Competition>> getAllLeagues() {
        return ResponseEntity.ok(competitionRepo.findAll().stream()
                .filter(c -> c.getType() == CompetitionType.LEAGUE)
                .toList());
    }

    @GetMapping("/tournament")
    public ResponseEntity<List<Competition>> getAllTournaments() {
        return ResponseEntity.ok(competitionRepo.findAll().stream()
                .filter(c -> c.getType() == CompetitionType.TOURNAMENT)
                .toList());
    }
    // Ajoute ceci dans CompetitionController.java pour supporter l'URL du front
    @GetMapping("/matches/competition/{id}")
    public ResponseEntity<List<MatchCompetition>> getMatchesByComp(@PathVariable String id) {
        return ResponseEntity.ok(matchRepo.findByCompetitionId(id));
    }

    @GetMapping
    public ResponseEntity<List<Competition>> getAllCompetitions() {
        // Cette méthode répondra à GET /api/competitions
        return ResponseEntity.ok(competitionRepo.findAll());
    }
}