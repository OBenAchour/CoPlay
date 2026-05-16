package com.example.coplaybackend.Controllers.Events;

import com.example.coplaybackend.DTOs.Events.TrainingSessionRequestDTO;
import com.example.coplaybackend.Entities.Events.TrainingSession;
import com.example.coplaybackend.Services.Events.TrainingSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TrainingSessionController — gestion des séances d'entraînement planifiées.
 *
 * Permissions (à activer après intégration Spring Security + module Auth) :
 *  - Créer séance OFFICIELLE (avec program) : ADMIN ou COACH
 *  - Créer séance LIBRE (sans program) : tout membre de l'équipe
 *  - Modifier/Annuler : COACH ou créateur
 *  - Compléter : ADMIN ou COACH
 */
@RestController
@RequestMapping("/api/training-sessions")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class TrainingSessionController {

    private final TrainingSessionService sessionService;

    // ═══════════════════════════════════════════════════════════════
    //  CRUD
    // ═══════════════════════════════════════════════════════════════

    /**
     * Crée une nouvelle séance d'entraînement.
     * POST /api/training-sessions/add
     *
     * Règle métier :
     *  - Si programId fourni → COACH/ADMIN requis (séance officielle)
     *  - Si programId null → tout membre de l'équipe peut créer (séance libre)
     */
    // TODO Auth Integration: décommenter après intégration Spring Security
    // @PreAuthorize("(#dto.programId == null and @teamSecurityService.isMemberOfTeam(authentication, #dto.teamId)) " +
    //               "or hasRole('ADMIN') " +
    //               "or @teamSecurityService.isCoachOfTeam(authentication, #dto.teamId)")
    @PostMapping("/add")
    public ResponseEntity<TrainingSession> createSession(@RequestBody TrainingSessionRequestDTO dto) {

        TrainingSession session = sessionService.buildSessionFromIds(
                dto.getTitle(),
                dto.getDescription(),
                dto.getSessionDate(),
                dto.getDuration(),
                dto.getTeamId(),
                dto.getLocationId(),
                dto.getCreatedById(),
                dto.getProgramId()
        );

        TrainingSession created = sessionService.createSession(session);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/all")
    public ResponseEntity<List<TrainingSession>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/get/{sessionId}")
    public ResponseEntity<TrainingSession> getSessionById(@PathVariable String sessionId) {
        return ResponseEntity.ok(sessionService.getSessionById(sessionId));
    }

    @GetMapping("/get/team/{teamId}")
    public ResponseEntity<List<TrainingSession>> getSessionsByTeam(@PathVariable String teamId) {
        return ResponseEntity.ok(sessionService.getSessionsByTeam(teamId));
    }

    @GetMapping("/get/team/{teamId}/upcoming")
    public ResponseEntity<List<TrainingSession>> getUpcomingByTeam(@PathVariable String teamId) {
        return ResponseEntity.ok(sessionService.getUpcomingSessionsByTeam(teamId));
    }

    /**
     * Modifie une séance existante.
     * PUT /api/training-sessions/update/{sessionId}
     */
    // TODO Auth Integration: décommenter après intégration Spring Security
    // @PreAuthorize("hasRole('ADMIN') " +
    //               "or @teamSecurityService.isCoachOfSession(authentication, #sessionId) " +
    //               "or @teamSecurityService.isCreatorOfSession(authentication, #sessionId)")
    @PutMapping("/update/{sessionId}")
    public ResponseEntity<TrainingSession> updateSession(
            @PathVariable String sessionId,
            @RequestBody TrainingSessionRequestDTO dto) {

        TrainingSession updatedData = sessionService.buildSessionFromIds(
                dto.getTitle(),
                dto.getDescription(),
                dto.getSessionDate(),
                dto.getDuration(),
                dto.getTeamId(),
                dto.getLocationId(),
                dto.getCreatedById(),
                dto.getProgramId()
        );

        return ResponseEntity.ok(sessionService.updateSession(sessionId, updatedData));
    }

    /**
     * Annule une séance (statut = CANCELLED).
     * PUT /api/training-sessions/cancel/{sessionId}
     */
    // TODO Auth Integration: décommenter après intégration Spring Security
    // @PreAuthorize("hasRole('ADMIN') " +
    //               "or @teamSecurityService.isCoachOfSession(authentication, #sessionId) " +
    //               "or @teamSecurityService.isCreatorOfSession(authentication, #sessionId)")
    @PutMapping("/cancel/{sessionId}")
    public ResponseEntity<Void> cancelSession(@PathVariable String sessionId) {
        sessionService.cancelSession(sessionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Marque une séance comme COMPLETED.
     * PUT /api/training-sessions/complete/{sessionId}
     */
    // TODO Auth Integration: décommenter après intégration Spring Security
    // @PreAuthorize("hasRole('ADMIN') or @teamSecurityService.isCoachOfSession(authentication, #sessionId)")
    @PutMapping("/complete/{sessionId}")
    public ResponseEntity<TrainingSession> completeSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(sessionService.completeSession(sessionId));
    }

    /**
     * Supprime définitivement une séance.
     * DELETE /api/training-sessions/delete/{sessionId}
     */
    // TODO Auth Integration: décommenter après intégration Spring Security
    // @PreAuthorize("hasRole('ADMIN') or @teamSecurityService.isCoachOfSession(authentication, #sessionId)")
    @DeleteMapping("/delete/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable String sessionId) {
        sessionService.deleteSession(sessionId);
        return ResponseEntity.noContent().build();
    }
}