package com.example.coplaybackend.Services.Teams;

import com.example.coplaybackend.Entities.Teams.CoachingSession;

import java.time.LocalDateTime;
import java.util.List;

public interface CoachingSessionService {

    /**
     * Schedule a coaching session.
     * Throws IllegalStateException if the athlete has an ACTIVE injury.
     */
    CoachingSession scheduleSession(String coachId,
                                    String athleteId,
                                    String programId,
                                    LocalDateTime scheduledAt,
                                    Integer duration);

    CoachingSession linkToMarketplaceService(String sessionId, String marketplaceServiceId);

    CoachingSession markCompleted(String sessionId, String notes);

    CoachingSession cancel(String sessionId);

    List<CoachingSession> getByCoach(String coachId);

    List<CoachingSession> getByAthlete(String athleteId);

    /** Creates a session pre-linked to a paid MarketplaceService order. */
    CoachingSession createFromPaidService(String coachId,
                                          String athleteId,
                                          String linkedServiceId);
}
