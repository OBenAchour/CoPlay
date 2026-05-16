package com.example.coplaybackend.Repositories.Teams;

import com.example.coplaybackend.Entities.Teams.AthleteProgress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AthleteProgressRepository extends MongoRepository<AthleteProgress, String> {

    List<AthleteProgress> findByAthleteId(String athleteId);

    List<AthleteProgress> findByAthleteIdAndProgramId(String athleteId, String programId);

    List<AthleteProgress> findByAthleteIdAndExerciseId(String athleteId, String exerciseId);
}
