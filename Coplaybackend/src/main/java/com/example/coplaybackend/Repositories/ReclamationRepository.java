package com.example.coplaybackend.Repositories;

import com.example.coplaybackend.Entities.Reclamation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReclamationRepository extends MongoRepository<Reclamation, String> {
    // Vous pourrez ajouter des méthodes de tri par date plus tard
}
