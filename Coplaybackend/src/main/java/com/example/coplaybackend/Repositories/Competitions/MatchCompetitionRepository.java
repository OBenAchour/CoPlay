package com.example.coplaybackend.Repositories.Competitions;

import com.example.coplaybackend.Entities.Competitions.MatchCompetition;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchCompetitionRepository extends MongoRepository<MatchCompetition, String> {

    /**
     * Correction majeure : Utilisation de $oid pour convertir le String en ObjectId
     * indispensable pour les relations @DBRef dans MongoDB.
     */
    @Query("{ 'competition.$id' : { $oid: ?0 } }")
    List<MatchCompetition> findByCompetitionId(String competitionId);

    /**
     * Récupère les matchs programmés (date non nulle) pour une compétition.
     */
    @Query("{ 'competition.$id' : { $oid: ?0 }, 'dateMatch' : { $ne : null } }")
    List<MatchCompetition> findByCompetitionIdAndDateMatchIsNotNull(String competitionId);

    /**
     * Récupère les matchs par numéro de journée (Round).
     */
    @Query("{ 'competition.$id' : { $oid: ?0 }, 'numeroJournee' : ?1 }")
    List<MatchCompetition> findByCompetitionIdAndNumeroJournee(String competitionId, Integer numeroJournee);
}