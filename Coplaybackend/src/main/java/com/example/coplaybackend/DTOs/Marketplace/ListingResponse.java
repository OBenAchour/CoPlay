package com.example.coplaybackend.DTOs.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.ListingStatus;
import com.example.coplaybackend.Entities.Marketplace.ListingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO pour la réponse d'une annonce complète
 * Contient tous les champs de l'entité Listing
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingResponse {

    private String listingId;
    private String sellerId;
    private String title;
    private String description;
    private ListingType type;
    private Double price;
    private Double commissionRate;
    private Double totalWithCommission;
    private ListingStatus status;
    private String category;
    private List<String> images;
    private Double averageRating;
    private Integer ratingCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;
}
