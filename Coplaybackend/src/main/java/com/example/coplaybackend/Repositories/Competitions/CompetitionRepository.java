package com.example.coplaybackend.Repositories.Competitions;

import com.example.coplaybackend.Entities.Competitions.Competition;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompetitionRepository extends MongoRepository<Competition, String> {
    // La hiérarchie (Ligue/Tournoi) est gérée par le polymorphisme MongoDB
}

