package com.example.coplaybackend.Repositories.Teams;

import com.example.coplaybackend.Entities.Teams.CoachingSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CoachingSessionRepository extends MongoRepository<CoachingSession, String> {

    List<CoachingSession> findByCoachId(String coachId);

    List<CoachingSession> findByAthleteId(String athleteId);

    List<CoachingSession> findByLinkedServiceId(String linkedServiceId);
}
