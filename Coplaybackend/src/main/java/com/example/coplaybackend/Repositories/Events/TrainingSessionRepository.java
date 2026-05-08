package com.example.coplaybackend.Repositories.Events;

import com.example.coplaybackend.Entities.Events.EventStatus;
import com.example.coplaybackend.Entities.Events.TrainingSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrainingSessionRepository extends MongoRepository<TrainingSession, String> {

    /** Toutes les sessions d'une équipe */
    @Query("{ 'teamId.$id' : ?0 }")
    List<TrainingSession> findByTeamId(String teamId);

    /** Sessions d'une équipe filtrées par statut */
    @Query("{ 'teamId.$id' : ?0, 'status' : ?1 }")
    List<TrainingSession> findByTeamIdAndStatus(String teamId, EventStatus status);

    /** Sessions à venir d'une équipe */
    @Query("{ 'teamId.$id' : ?0, 'sessionDate' : { $gt : ?1 } }")
    List<TrainingSession> findByTeamIdAndSessionDateAfter(String teamId, LocalDateTime date);

    /** Sessions créées par un utilisateur */
    @Query("{ 'createdBy.$id' : ?0 }")
    List<TrainingSession> findByCreatedBy(String userId);

    /** Sessions liées à un programme */
    @Query("{ 'program.$id' : ?0 }")
    List<TrainingSession> findByProgramId(String programId);
}