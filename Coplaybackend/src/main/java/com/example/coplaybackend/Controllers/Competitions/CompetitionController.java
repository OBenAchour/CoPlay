package com.example.coplaybackend.Controllers.Competitions;

import com.example.coplaybackend.DTOs.Competitions.CompetitionSummaryDTO;
import com.example.coplaybackend.DTOs.Competitions.CreateCompetitionRequest;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Competitions.*;
import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionStatus;
import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionType;
import com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Entities.Teams.TeamMember;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Competitions.CompetitionRepository;
import com.example.coplaybackend.Repositories.Competitions.MatchCompetitionRepository;
import com.example.coplaybackend.Repositories.Teams.TeamMemberRepository;
import com.example.coplaybackend.Services.Competitions.*;
import com.example.coplaybackend.Repositories.Competitions.InscriptionRepository;
import com.example.coplaybackend.Repositories.Teams.TeamRepository;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/competitions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CompetitionController {
    
    private final CompetitionRepository competitionRepo;
    private final MatchCompetitionRepository matchRepo;
    private final CalendarService calendarService;
    private final TournoiService tournoiService;
    private final ClassementService classementService;
    private final TeamMemberService teamMemberService;
    private final StatistiqueJoueurService joueurService;
    private final MatchService matchService;
    private final InscriptionRepository inscriptionRepo;
    private final TeamMemberRepository teamMemberRepo;
    private final UserRepository userRepo;
    private final TeamRepository teamRepo;
    
    @Autowired
    private MongoTemplate mongoTemplate;

    @PostMapping("/matches/{matchId}/update-score")
    public ResponseEntity<?> updateScore(
            @PathVariable String matchId,
            @RequestBody Map<String, Integer> scores,
            @RequestHeader("User-ID") String userId) {

        MatchCompetition match = matchRepo.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match non trouvé"));

        boolean isAdmin = "hamdi".equals(userId);
        boolean isCaptain = teamMemberService.getMembers(match.getEquipeA().getTeamId()).stream()
                .anyMatch(m -> m.getUserId().equals(userId) && m.getRoleEquipe() == RoleEquipe.CAPTAIN) ||
                teamMemberService.getMembers(match.getEquipeB().getTeamId()).stream()
                        .anyMatch(m -> m.getUserId().equals(userId) && m.getRoleEquipe() == RoleEquipe.CAPTAIN);

        if (isAdmin || isCaptain) {
            match.setScoreA(scores.get("scoreA"));
            match.setScoreB(scores.get("scoreB"));
            match.setStatus(MatchStatus.FINISHED);
            match.setIsValidated(true);

            matchRepo.save(match);
            classementService.updateClassement(match.getCompetition().getId());

            return ResponseEntity.ok(match);
        }

        return ResponseEntity.status(403).body("Accès refusé.");
    }

    @PostMapping("/{id}/generate-calendar")
    public ResponseEntity<?> generateCalendar(@PathVariable String id, @RequestParam(required = false) Boolean doubleLeg) {
        Competition competition = competitionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Compétition non trouvée"));

        List<Team> teams = calendarService.getTeamsRegisteredForCompetition(id);

        if (teams.size() < 2) {
            return ResponseEntity.badRequest().body(Map.of("error", "Il faut au moins 2 équipes inscrites."));
        }

        if (competition.getType() == CompetitionType.LEAGUE) {
            List<Journee> journees = calendarService.generateRoundRobinCalendar(
                    teams, competition.getStartDate(), doubleLeg != null ? doubleLeg : true);

            List<MatchCompetition> allMatches = new ArrayList<>();
            for (Journee j : journees) {
                for (MatchCompetition m : j.getMatchs()) {
                    m.setCompetition(competition);
                    m.setStatus(MatchStatus.SCHEDULED);
                    m.setNumeroJournee(j.getNumero());
                    allMatches.add(m);
                }
            }
            matchRepo.saveAll(allMatches);
            competition.setStatus(CompetitionStatus.CALENDAR_GENERATED);
            competitionRepo.save(competition);

            return ResponseEntity.ok(Map.of("message", "Calendrier OK", "journees", journees.size()));
        } else {
            Tournoi tournoi = tournoiService.generateTournamentBracket(id, teams, doubleLeg != null ? doubleLeg : true);
            return ResponseEntity.ok(Map.of("message", "Bracket OK", "rounds", tournoi.getTotalRounds()));
        }
    }

    @GetMapping("/{id}/classement")
    public ResponseEntity<List<ClassementService.ClassementDTO>> getClassement(@PathVariable String id) {
        return ResponseEntity.ok(classementService.getClassementWithDetails(id));
    }

    @GetMapping
    public ResponseEntity<List<CompetitionSummaryDTO>> getAllCompetitions() {
        try {
            return ResponseEntity.ok(competitionRepo.findAllSummaries());
        } catch (Exception e) {
            System.err.println("Error fetching competitions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCompetition(@PathVariable String id) {
        Competition competition = competitionRepo.findById(id)
                .orElse(null);

        if (competition == null) {
            return ResponseEntity.status(404).body("Compétition non trouvée.");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (auth != null) ? auth.getName() : null;
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));

        User currentUser = userRepo.findByEmail(currentUserId)
                .orElse(null);
        String trueUserId = (currentUser != null) ? currentUser.getId() : null;

        boolean isCreator = competition.getCreator() != null && competition.getCreator().getId().equals(trueUserId);

        if (!isAdmin && !isCreator) {
            return ResponseEntity.status(403).body("Accès refusé. Vous devez être ADMIN ou le créateur.");
        }

        try {
            competitionRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Compétition supprimée avec succès."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de la suppression.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCompetitionById(@PathVariable String id) {
        Competition comp = competitionRepo.findById(id).orElse(null);
        if (comp == null) return ResponseEntity.notFound().build();

        // Récupérer les IDs des équipes inscrites
        List<String> teamIds = inscriptionRepo.findByCompetitionId(id).stream()
                .map(Inscription::getTeamId)
                .distinct()
                .toList();

        // Récupérer les objets Team correspondants
        List<Team> registeredTeams = teamRepo.findAllById(teamIds);

        // On peut renvoyer un Map pour inclure les détails de la compétition + les équipes
        return ResponseEntity.ok(Map.of(
            "competition", comp,
            "registeredTeams", registeredTeams
        ));
    }

    /* ─── NEW METHODS FOR STATISTICS FEATURE ─── */

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics(@RequestParam String competitionId) {
        List<StatistiqueJoueur> topScorers = joueurService.getTopScorers(competitionId);
        List<StatistiqueJoueur> bestPlayers = joueurService.getBestPlayers(competitionId);
        List<MatchCompetition> matches = matchRepo.findByCompetitionId(competitionId);
        
        long playedMatches = matches.stream()
                .filter(m -> m.getScoreA() != null && m.getScoreB() != null)
                .count();

        return ResponseEntity.ok(Map.of(
            "competitionId", competitionId,
            "topScorers", topScorers,
            "bestPlayers", bestPlayers,
            "totalMatches", matches.size(),
            "playedMatches", playedMatches
        ));
    }

    @PutMapping("/statistics/update")
    public ResponseEntity<?> updateStats(@RequestParam String matchId, @RequestBody Map<String, Integer> scores) {
        MatchCompetition match = matchRepo.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match non trouvé"));
        
        match.setScoreA(scores.get("scoreA"));
        match.setScoreB(scores.get("scoreB"));
        match.setStatus(MatchStatus.FINISHED);
        match.setIsValidated(true);
        
        matchRepo.save(match);
        classementService.updateClassement(match.getCompetition().getId());
        
        return ResponseEntity.ok(match);
    }

    @PutMapping("/match/{matchId}/statistics")
    public ResponseEntity<?> updateMatchStatistics(
            @PathVariable String matchId,
            @RequestBody Map<String, Object> statsData) {

        MatchCompetition match = matchRepo.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match non trouvé"));

        // Use JWT SecurityContext (populated by JwtAuthenticationFilter)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = (auth != null) ? auth.getName() : "";
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));

        boolean isCaptain = false;
        if (!isAdmin && auth != null) {
            try {
                isCaptain = teamMemberService.getMembers(match.getEquipeA().getTeamId()).stream()
                        .anyMatch(m -> m.getUserId().equals(userEmail) && m.getRoleEquipe() == RoleEquipe.CAPTAIN) ||
                        teamMemberService.getMembers(match.getEquipeB().getTeamId()).stream()
                                .anyMatch(m -> m.getUserId().equals(userEmail) && m.getRoleEquipe() == RoleEquipe.CAPTAIN);
            } catch (Exception e) {
                System.err.println("Captain check failed: " + e.getMessage());
            }
        }

        System.out.println("STATS UPDATE - User: " + userEmail + ", isAdmin: " + isAdmin + ", isCaptain: " + isCaptain);

        if (isAdmin || isCaptain) {
            matchService.updateMatchStatistics(matchId, statsData);
            return ResponseEntity.ok(match);
        }

        return ResponseEntity.status(403).body("Accès refusé. Rôle requis: ADMIN ou CAPTAIN.");
    }


    @GetMapping("/match/{id}")
    public ResponseEntity<MatchCompetition> getCompetitionMatch(@PathVariable String id) {
        return matchRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createCompetition(
            @Valid @RequestBody CreateCompetitionRequest request) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            return ResponseEntity.status(403).body("Accès refusé. ADMIN requis.");
        }

        Competition competition;
        if (request.getType() == CompetitionType.LEAGUE) {
            competition = new Ligue();
        } else if (request.getType() == CompetitionType.TOURNAMENT) {
            competition = new Tournoi();
        } else {
            return ResponseEntity.badRequest().body("Type de compétition invalide.");
        }

        competition.setName(request.getName());
        competition.setSport(request.getSport());
        competition.setStartDate(request.getStartDate());
        competition.setEndDate(request.getEndDate());
        competition.setMaxTeams(request.getMaxTeams());
        competition.setType(request.getType());
        competition.setIsDoubleLeg(request.getDoubleLeg());

        // optional fields
        competition.setStatus(CompetitionStatus.IN_PROGRESS);
        competition.setCurrentRound(1);
        competition.setCountTeams(0);

        competitionRepo.save(competition);

        return ResponseEntity.ok(competition);
    }

     // Ajoute ceci en haut de ton contrôleur

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinCompetition(@PathVariable String id) {
        // 1. Récupération de la compétition
        Competition comp = competitionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Compétition introuvable"));

        // 2. Identification de l'utilisateur via son Email (pour obtenir le vrai ID)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(401).build();

        User user = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        String trueUserId = user.getId(); // Utiliser userId explicitement

        // 3. Vérification du rôle (COACH, CAPTAIN ou ADMIN)
        boolean isAuth = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().toUpperCase().replaceAll("ROLE_", "").matches("COACH|CAPTAIN|ADMIN"));
        if (!isAuth) return ResponseEntity.status(403).body("Rôle insuffisant");

        // 4. Utilisation du Repository standard (fonctionnera après correction MongoDB)
        TeamMember membership = teamMemberRepo.findByUserId(trueUserId).stream()
                .filter(m -> m.getRoleEquipe() == RoleEquipe.CAPTAIN || m.getRoleEquipe() == RoleEquipe.COACH)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucune équipe trouvée pour ce responsable"));

        String teamId = membership.getTeamId();

        // 5. Validations métier
        if (inscriptionRepo.existsByCompetitionIdAndTeamId(id, teamId)) {
            return ResponseEntity.badRequest().body("Équipe déjà inscrite.");
        }

        if (comp.getMaxTeams() != null && inscriptionRepo.countByCompetitionId(id) >= comp.getMaxTeams()) {
            return ResponseEntity.badRequest().body("Compétition complète.");
        }

        // Vérification de la date de fin (gestion manuelle pour éviter les erreurs de conversion LocalDate si besoin)
        if (comp.getEndDate() != null) {
            LocalDate today = LocalDate.now();
            if (comp.getEndDate().isBefore(today)) {
                return ResponseEntity.badRequest().body("La compétition est déjà terminée.");
            }
        }

        // 6. Enregistrement via InscriptionRepo
        inscriptionRepo.save(Inscription.builder()
                .competitionId(id)
                .teamId(teamId)
                .userId(trueUserId)
                .status("ACCEPTED")
                .build());

        // 7. Mise à jour du compteur countTeams dans la compétition
        long uniqueTeamsCount = inscriptionRepo.findByCompetitionId(id).stream()
                .map(Inscription::getTeamId)
                .distinct()
                .count();
        
        comp.setCountTeams((int) uniqueTeamsCount);
        competitionRepo.save(comp);

        return ResponseEntity.ok(Map.of(
            "message", "Inscription réussie !", 
            "teamId", teamId,
            "countTeams", comp.getCountTeams()
        ));
    }
}