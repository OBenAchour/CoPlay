package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour les catégories du marketplace
 */
@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {

    /**
     * Récupère toutes les catégories actives triées par ordre d'affichage
     */
    List<Category> findByActiveTrueOrderByDisplayOrderAsc();

    /**
     * Vérifie si une catégorie existe par son nom
     */
    boolean existsByName(String name);

    /**
     * Récupère une catégorie par son nom
     */
    Category findByName(String name);
}
