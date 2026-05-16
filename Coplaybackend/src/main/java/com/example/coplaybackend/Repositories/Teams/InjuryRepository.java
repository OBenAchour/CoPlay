package com.example.coplaybackend.Repositories.Teams;

import com.example.coplaybackend.Entities.Teams.Injury;
import com.example.coplaybackend.Entities.Teams.InjuryStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InjuryRepository extends MongoRepository<Injury, String> {

    List<Injury> findByAthleteId(String athleteId);

    List<Injury> findByAthleteIdAndStatus(String athleteId, InjuryStatus status);
}
