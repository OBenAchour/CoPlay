package com.example.coplaybackend.DTOs.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.ListingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO pour la création d'une annonce
 * US-055 : Création d'une annonce
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateListingRequest {

    /**
     * Titre de l'annonce
     */
    private String title;

    /**
     * Description détaillée
     */
    private String description;

    /**
     * Type : SALE, RENTAL ou SERVICE
     */
    private ListingType type;

    /**
     * Prix de base
     */
    private Double price;

    /**
     * Catégorie (sport ou type de service)
     */
    private String category;

    /**
     * Liste des URLs des images
     */
    private List<String> images;
}
