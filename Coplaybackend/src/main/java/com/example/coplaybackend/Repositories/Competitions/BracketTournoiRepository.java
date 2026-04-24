package com.example.coplaybackend.Repositories.Competitions;

import com.example.coplaybackend.Entities.Competitions.BracketTournoi;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BracketTournoiRepository extends MongoRepository<BracketTournoi, String> {

    List<BracketTournoi> findByCompetitionIdOrderByRoundAsc(String competitionId);

    Optional<BracketTournoi> findByCompetitionIdAndRound(String competitionId, Integer round);

    Optional<BracketTournoi> findByCompetitionIdAndPhase(String competitionId, String phase);
}
