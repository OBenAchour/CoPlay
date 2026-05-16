package com.example.coplaybackend.Repositories.Coaching;

import com.example.coplaybackend.Entities.Coaching.CoachingProgram;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoachingProgramRepository extends MongoRepository<CoachingProgram, String> {
    List<CoachingProgram> findByCoachId(String coachId);
    List<CoachingProgram> findByClientId(String clientId);
    List<CoachingProgram> findByCoachIdAndStatus(String coachId, String status);
}
