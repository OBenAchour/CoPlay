package com.example.coplaybackend.Services.Events;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Events.*;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Events.LocationRepository;
import com.example.coplaybackend.Repositories.Events.TrainingProgramRepository;
import com.example.coplaybackend.Repositories.Events.TrainingSessionRepository;
import com.example.coplaybackend.Repositories.Teams.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * TrainingSessionService — logique métier des séances d'entraînement.
 *
 * Responsabilités :
 *  1. CRUD complet sur les sessions
 *  2. Validation : sessionDate doit être dans le futur
 *  3. Gestion du statut (SCHEDULED → COMPLETED / CANCELLED)
 *  4. Distinction séance officielle (avec program) vs libre (sans program)
 *  5. Construction d'une session depuis les IDs (helper Controller)
 */
@Service
@RequiredArgsConstructor
public class TrainingSessionService {

    private final TrainingSessionRepository sessionRepository;
    private final TrainingProgramRepository programRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final LocationRepository locationRepository;

    // ═══════════════════════════════════════════════════════════════
    //  CRUD
    // ═══════════════════════════════════════════════════════════════

    /**
     * Crée une nouvelle séance d'entraînement.
     *
     * Règles métier :
     *  - sessionDate doit être dans le futur
     *  - Si program présent → séance OFFICIELLE
     *  - Si program null → séance LIBRE
     *  - Statut forcé à SCHEDULED
     */
    public TrainingSession createSession(TrainingSession session) {

        if (session.getSessionDate() == null || session.getSessionDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("La date de la séance doit être dans le futur.");
        }

        session.setIsOfficial(session.getProgram() != null);
        session.setStatus(EventStatus.SCHEDULED);

        return sessionRepository.save(session);
    }

    public List<TrainingSession> getAllSessions() {
        return sessionRepository.findAll();
    }

    public TrainingSession getSessionById(String sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Séance introuvable : " + sessionId));
    }

    public List<TrainingSession> getSessionsByTeam(String teamId) {
        return sessionRepository.findByTeamId(teamId);
    }

    public List<TrainingSession> getUpcomingSessionsByTeam(String teamId) {
        return sessionRepository.findByTeamIdAndSessionDateAfter(teamId, LocalDateTime.now());
    }

    /**
     * Modifie une séance existante.
     * Règle : impossible si la séance n'est pas SCHEDULED.
     */
    public TrainingSession updateSession(String sessionId, TrainingSession updatedData) {
        TrainingSession existing = getSessionById(sessionId);

        if (existing.getStatus() != EventStatus.SCHEDULED) {
            throw new IllegalStateException("Impossible de modifier une séance " + existing.getStatus());
        }

        existing.setTitle(updatedData.getTitle());
        existing.setDescription(updatedData.getDescription());
        existing.setSessionDate(updatedData.getSessionDate());
        existing.setDuration(updatedData.getDuration());
        existing.setLocationId(updatedData.getLocationId());
        existing.setProgram(updatedData.getProgram());
        existing.setIsOfficial(updatedData.getProgram() != null);

        return sessionRepository.save(existing);
    }

    /**
     * Annule une séance (statut = CANCELLED).
     */
    public void cancelSession(String sessionId) {
        TrainingSession session = getSessionById(sessionId);

        if (session.getStatus() == EventStatus.COMPLETED ||
                session.getStatus() == EventStatus.CANCELLED) {
            throw new IllegalStateException("Impossible d'annuler une séance " + session.getStatus());
        }

        session.setStatus(EventStatus.CANCELLED);
        sessionRepository.save(session);
    }

    /**
     * Marque une séance comme COMPLETED.
     */
    public TrainingSession completeSession(String sessionId) {
        TrainingSession session = getSessionById(sessionId);

        if (session.getStatus() != EventStatus.SCHEDULED) {
            throw new IllegalStateException("Seule une séance SCHEDULED peut être complétée.");
        }

        session.setStatus(EventStatus.COMPLETED);
        return sessionRepository.save(session);
    }

    public void deleteSession(String sessionId) {
        if (!sessionRepository.existsById(sessionId)) {
            throw new RuntimeException("Séance introuvable : " + sessionId);
        }
        sessionRepository.deleteById(sessionId);
    }

    // ═══════════════════════════════════════════════════════════════
    //  HELPERS — chargement des objets depuis les IDs
    // ═══════════════════════════════════════════════════════════════

    /**
     * Construit un TrainingSession à partir d'un DTO.
     * Charge les objets complets (Team, Location, User, Program) depuis MongoDB.
     */
    public TrainingSession buildSessionFromIds(
            String title, String description, LocalDateTime sessionDate, Integer duration,
            String teamId, String locationId, String createdById, String programId) {

        TrainingSession.TrainingSessionBuilder builder = TrainingSession.builder()
                .title(title)
                .description(description)
                .sessionDate(sessionDate)
                .duration(duration);

        if (teamId != null && !teamId.isEmpty()) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Équipe introuvable : " + teamId));
            builder.teamId(team);
        }

        if (locationId != null && !locationId.isEmpty()) {
            Location location = locationRepository.findById(locationId)
                    .orElseThrow(() -> new RuntimeException("Lieu introuvable : " + locationId));
            builder.locationId(location);
        }

        if (createdById != null && !createdById.isEmpty()) {
            // On essaie d'abord de trouver l'user par ID, sinon par email
            User user = userRepository.findById(createdById)
                    .orElseGet(() -> userRepository.findByEmail(createdById)
                            .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + createdById)));
            builder.createdBy(user);
        }

        if (programId != null && !programId.isEmpty()) {
            TrainingProgram program = programRepository.findById(programId)
                    .orElseThrow(() -> new RuntimeException("Programme introuvable : " + programId));
            builder.program(program);
        }

        return builder.build();
    }
}