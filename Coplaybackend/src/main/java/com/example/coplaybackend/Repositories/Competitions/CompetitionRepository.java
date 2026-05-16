package com.example.coplaybackend.Repositories.Competitions;

import com.example.coplaybackend.Entities.Competitions.Competition;
import com.example.coplaybackend.DTOs.Competitions.CompetitionSummaryDTO;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompetitionRepository extends MongoRepository<Competition, String> {

    @Aggregation(pipeline = {
        "{ '$lookup': { 'from': 'inscriptions', 'localField': '_id', 'foreignField': 'competitionId', 'as': 'inscriptions' } }",
        "{ '$project': { " +
            "'id': { '$toString': '$_id' }, " +
            "'name': 1, " +
            "'sport': 1, " +
            "'startDate': 1, " +
            "'endDate': 1, " +
            "'status': 1, " +
            "'type': 1, " +
            "'maxTeams': 1, " +
            "'isDoubleLeg': 1, " +
            "'currentRound': 1, " +
            "'totalRounds': 1, " +
            "'countTeams': 1 " +
        "} }"
    })
    List<CompetitionSummaryDTO> findAllSummaries();

    List<CompetitionSummaryDTO> findById();
}
