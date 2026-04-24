package com.example.coplaybackend.Repositories.Competitions;

import com.example.coplaybackend.Entities.Competitions.Classement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassementRepository extends MongoRepository<Classement, String> {
    Optional<Classement> findByCompetitionId(String competitionId);
}

