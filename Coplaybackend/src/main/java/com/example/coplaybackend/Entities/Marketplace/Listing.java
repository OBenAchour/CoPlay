package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    private String listingId;

    /**
     * Email du vendeur (identification)
     * US-055 : Création d'une annonce par un vendeur
     */
    private String sellerId;

    /**
     * Titre de l'annonce
     */
    private String title;

    /**
     * Description détaillée du produit/service
     */
    private String description;

    /**
     * Type d'annonce : VENTE, LOCATION ou SERVICE
     */
    private ListingType type;

    /**
     * Prix de base (sans commission)
     */
    private Double price;

    /**
     * Taux de commission appliqué selon le type
     * SALE = 0.05 (5%)
     * RENTAL = 0.10 (10%)
     * SERVICE = 0.15 (15%)
     */
    private Double commissionRate;

    /**
     * Prix total avec commission incluse
     * totalWithCommission = price + (price * commissionRate)
     */
    private Double totalWithCommission;

    /**
     * Statut actuel de l'annonce
     */
    private ListingStatus status;

    /**
     * Catégorie de l'annonce (ex: FOOTBALL, TENNIS, BASKETBALL...)
     */
    private String category;

    /**
     * Liste des URLs des images
     */
    private java.util.List<String> images;

    /**
     * Note moyenne de l'annonce
     */
    private Double averageRating;

    /**
     * Nombre d'avis reçus
     */
    private Integer ratingCount;

    /**
     * Date de création de l'annonce
     */
    private LocalDateTime createdAt;

    /**
     * Date de dernière modification
     */
    private LocalDateTime updatedAt;

    /**
     * Date d'expiration de l'annonce (création + 90 jours)
     * US-059 : Expiration automatique des annonces
     */
    private LocalDateTime expiresAt;
}
