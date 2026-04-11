package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Listing;
import com.example.coplaybackend.Entities.Marketplace.ListingStatus;
import com.example.coplaybackend.Entities.Marketplace.ListingType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository pour les annonces du marketplace
 */
@Repository
public interface ListingRepository extends MongoRepository<Listing, String> {

    /**
     * Récupère toutes les annonces d'un vendeur
     * US-060 : Voir mes annonces
     */
    List<Listing> findBySellerId(String sellerId);

    /**
     * Récupère les annonces par statut
     */
    List<Listing> findByStatus(ListingStatus status);

    /**
     * Récupère les annonces par type et statut
     */
    List<Listing> findByTypeAndStatus(ListingType type, ListingStatus status);

    /**
     * Récupère les annonces expirées (date d'expiration dépassée)
     * US-059 : Expiration automatique des annonces
     */
    List<Listing> findByExpiresAtBefore(LocalDateTime date);

    /**
     * Recherche d'annonces par mot-clé dans le titre et par statut
     * US-057 : Recherche d'annonces
     */
    List<Listing> findByTitleContainingIgnoreCaseAndStatus(String keyword, ListingStatus status);

    /**
     * Recherche par catégorie et statut
     */
    List<Listing> findByCategoryAndStatus(String category, ListingStatus status);

    /**
     * Recherche par type, catégorie et statut
     */
    List<Listing> findByTypeAndCategoryAndStatus(ListingType type, String category, ListingStatus status);

    /**
     * Recherche par fourchette de prix et statut
     */
    List<Listing> findByPriceBetweenAndStatus(Double minPrice, Double maxPrice, ListingStatus status);

    /**
     * Recherche par prix minimum et statut
     */
    List<Listing> findByPriceGreaterThanEqualAndStatus(Double minPrice, ListingStatus status);

    /**
     * Recherche par prix maximum et statut
     */
    List<Listing> findByPriceLessThanEqualAndStatus(Double maxPrice, ListingStatus status);

    /**
     * Recherche par type, prix et statut
     */
    List<Listing> findByTypeAndPriceBetweenAndStatus(ListingType type, Double minPrice, Double maxPrice, ListingStatus status);

    /**
     * Recherche par catégorie, prix et statut
     */
    List<Listing> findByCategoryAndPriceBetweenAndStatus(String category, Double minPrice, Double maxPrice, ListingStatus status);

    /**
     * Recherche par type, catégorie, prix et statut
     */
    List<Listing> findByTypeAndCategoryAndPriceBetweenAndStatus(ListingType type, String category, Double minPrice, Double maxPrice, ListingStatus status);
}
