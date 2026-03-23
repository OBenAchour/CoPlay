package com.example.coplaybackend.Repositories.Events;

import com.example.coplaybackend.Entities.Auth.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ⚠️ REPOSITORY TEMPORAIRE — À SUPPRIMER LORS DE L'INTÉGRATION
 *
 * Ce repository est créé temporairement pour permettre les tests
 * du module Events sans dépendre du module Auth de notre coéquipier.
 *
 * Lors de l'intégration :
 *  1. Supprimer ce fichier
 *  2. Importer le UserRepository du module Auth :
 *     import com.example.coplaybackend.Repositories.Auth.UserRepository;
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // Recherche par email — utile pour les tests
    Optional<User> findByEmail(String email);
}