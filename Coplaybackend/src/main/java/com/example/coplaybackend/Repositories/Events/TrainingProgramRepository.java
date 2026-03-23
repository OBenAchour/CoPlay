package com.example.coplaybackend.Repositories.Events;

import com.example.coplaybackend.Entities.Events.TrainingProgram;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TrainingProgramRepository extends MongoRepository<TrainingProgram, String> {

    List<TrainingProgram> findByTeamId(String teamId);

    List<TrainingProgram> findByLevel(String level);
}