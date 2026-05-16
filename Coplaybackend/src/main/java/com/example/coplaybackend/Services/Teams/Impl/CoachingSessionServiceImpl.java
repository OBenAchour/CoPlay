package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.CoachingSession;
import com.example.coplaybackend.Entities.Teams.SessionStatus;
import com.example.coplaybackend.Repositories.Teams.CoachingSessionRepository;
import com.example.coplaybackend.Services.Teams.CoachingSessionService;
import com.example.coplaybackend.Services.Teams.InjuryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CoachingSessionServiceImpl implements CoachingSessionService {

    private final CoachingSessionRepository repository;
    private final InjuryService injuryService;

    @Override
    public CoachingSession scheduleSession(String coachId,
                                           String athleteId,
                                           String programId,
                                           LocalDateTime scheduledAt,
                                           Integer duration) {

        if (!injuryService.isAthleteAvailable(athleteId)) {
            throw new IllegalStateException(
                    "Cannot schedule session: athlete " + athleteId + " has an active injury.");
        }

        CoachingSession session = CoachingSession.builder()
                .coachId(coachId)
                .athleteId(athleteId)
                .programId(programId)
                .scheduledAt(scheduledAt)
                .duration(duration)
                .status(SessionStatus.SCHEDULED)
                .createdAt(LocalDateTime.now())
                .build();

        return repository.save(session);
    }

    @Override
    public CoachingSession linkToMarketplaceService(String sessionId, String marketplaceServiceId) {
        CoachingSession session = repository.findById(sessionId).orElseThrow();
        session.setLinkedServiceId(marketplaceServiceId);
        return repository.save(session);
    }

    @Override
    public CoachingSession markCompleted(String sessionId, String notes) {
        CoachingSession session = repository.findById(sessionId).orElseThrow();
        session.setStatus(SessionStatus.COMPLETED);
        session.setNotes(notes);
        return repository.save(session);
    }

    @Override
    public CoachingSession cancel(String sessionId) {
        CoachingSession session = repository.findById(sessionId).orElseThrow();
        session.setStatus(SessionStatus.CANCELLED);
        return repository.save(session);
    }

    @Override
    public List<CoachingSession> getByCoach(String coachId) {
        return repository.findByCoachId(coachId);
    }

    @Override
    public List<CoachingSession> getByAthlete(String athleteId) {
        return repository.findByAthleteId(athleteId);
    }

    @Override
    public CoachingSession createFromPaidService(String coachId,
                                                 String athleteId,
                                                 String linkedServiceId) {

        CoachingSession session = CoachingSession.builder()
                .coachId(coachId)
                .athleteId(athleteId)
                .linkedServiceId(linkedServiceId)
                .status(SessionStatus.SCHEDULED)
                .createdAt(LocalDateTime.now())
                .build();

        return repository.save(session);
    }
}
