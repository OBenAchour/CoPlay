package com.example.coplaybackend.Repositories.Competitions;

import com.example.coplaybackend.Entities.Competitions.ResultatTournoi;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultatTournoiRepository extends MongoRepository<ResultatTournoi, String> {

    List<ResultatTournoi> findByCompetitionIdOrderByPositionFinaleAsc(String competitionId);

    Optional<ResultatTournoi> findByEquipeIdAndCompetitionId(String equipeId, String competitionId);

    List<ResultatTournoi> findByCompetitionIdAndEstElimineFalse(String competitionId);

    List<ResultatTournoi> findByCompetitionId(String competitionId);
}
