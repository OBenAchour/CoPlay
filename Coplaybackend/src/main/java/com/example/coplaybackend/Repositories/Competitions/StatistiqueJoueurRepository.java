package com.example.coplaybackend.Repositories.Competitions;

import com.example.coplaybackend.Entities.Competitions.StatistiqueJoueur;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StatistiqueJoueurRepository extends MongoRepository<StatistiqueJoueur, String> {

    List<StatistiqueJoueur> findByCompetitionIdOrderByButsDesc(String competitionId);

    List<StatistiqueJoueur> findByCompetitionIdOrderByPassesDecisivesDesc(String competitionId);

    List<StatistiqueJoueur> findByCompetitionIdOrderByCleanSheetsDesc(String competitionId);

    Optional<StatistiqueJoueur> findByJoueurIdAndCompetitionId(String joueurId, String competitionId);

    List<StatistiqueJoueur> findByCompetitionIdOrderByPointsDesc(String competitionId);

    List<StatistiqueJoueur> findByCompetitionIdOrderByEtoilesDesc(String competitionId);
}
