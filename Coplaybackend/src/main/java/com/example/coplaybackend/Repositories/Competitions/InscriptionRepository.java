package com.example.coplaybackend.Repositories.Competitions;

import com.example.coplaybackend.Entities.Competitions.Inscription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InscriptionRepository extends MongoRepository<Inscription, String> {
    List<Inscription> findByCompetitionId(String competitionId);
    long countByCompetitionId(String competitionId);
    boolean existsByCompetitionIdAndTeamId(String competitionId, String teamId);
}
