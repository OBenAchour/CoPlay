package com.example.coplaybackend.Repositories.Teams;
import com.example.coplaybackend.Entities.Teams.DemandeAdhesion;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DemandeAdhesionRepository extends MongoRepository<DemandeAdhesion,String> {

    List<DemandeAdhesion> findByTeamId(String teamId);

    List<DemandeAdhesion> findByUserId(String userId);

}
