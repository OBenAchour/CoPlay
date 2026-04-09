package com.example.coplaybackend.Repositories.Events;

import com.example.coplaybackend.Entities.Teams.Team;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * ⚠️ TEMPORAIRE — À SUPPRIMER LORS DE L'INTÉGRATION
 */
@Repository
public interface TeamRepository extends MongoRepository<Team, String> {

}