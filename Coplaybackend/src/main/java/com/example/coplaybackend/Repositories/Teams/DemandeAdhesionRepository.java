package com.example.coplaybackend.Repositories.Teams;

import com.example.coplaybackend.Entities.Teams.DemandeAdhesion;
import com.example.coplaybackend.Entities.Teams.StatutDemande;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DemandeAdhesionRepository extends MongoRepository<DemandeAdhesion, String> {

    List<DemandeAdhesion> findByTeamId(String teamId);

    List<DemandeAdhesion> findByUserId(String userId);

    List<DemandeAdhesion> findByTeamIdAndUserIdAndStatut(String teamId, String userId, StatutDemande statut);

    void deleteByTeamId(String teamId);  // ← AJOUTE
}