package com.example.coplaybackend.Repositories.Events;

import com.example.coplaybackend.Entities.Events.TrainingProgram;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingProgramRepository extends MongoRepository<TrainingProgram, String> {

    /** Tous les programmes d'une équipe */
    @Query("{ 'teamId.$id' : ?0 }")
    List<TrainingProgram> findByTeamId(String teamId);

    /** Programmes filtrés par niveau */
    List<TrainingProgram> findByLevel(String level);
}