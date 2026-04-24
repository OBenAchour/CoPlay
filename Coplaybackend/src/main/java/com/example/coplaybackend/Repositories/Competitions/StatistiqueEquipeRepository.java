package com.example.coplaybackend.Repositories.Competitions;

import com.example.coplaybackend.Entities.Competitions.StatistiqueEquipe;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StatistiqueEquipeRepository extends MongoRepository<StatistiqueEquipe, String> {

    Optional<StatistiqueEquipe> findByEquipe_TeamIdAndCompetitionId(String teamId, String competitionId);

    List<StatistiqueEquipe> findByCompetitionId(String competitionId);
}