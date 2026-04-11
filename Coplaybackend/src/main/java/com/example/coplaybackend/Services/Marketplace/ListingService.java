package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.CreateListingRequest;
import com.example.coplaybackend.Entities.Marketplace.Listing;
import com.example.coplaybackend.Entities.Marketplace.ListingStatus;
import com.example.coplaybackend.Entities.Marketplace.ListingType;
import com.example.coplaybackend.Repositories.Marketplace.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service pour la gestion des annonces du marketplace
 * US-055 : Création d'annonce
 * US-056 : Gestion des commissions
 * US-057 : Recherche d'annonces
 * US-059 : Expiration automatique
 * US-060 : Voir mes annonces
 * US-061 : Réserver une annonce
 * US-062 : Clôturer une annonce
 * US-064 : Noter une annonce
 */
@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;

    /**
     * Crée une nouvelle annonce
     * US-055, US-056, US-059
     */
    public Listing createListing(CreateListingRequest request, String sellerEmail) {
        // Calcul de la commission selon le type
        Double commissionRate = getCommissionRate(request.getType());

        // Calcul du prix total avec commission
        Double totalWithCommission = request.getPrice() + (request.getPrice() * commissionRate);

        LocalDateTime now = LocalDateTime.now();

        Listing listing = Listing.builder()
                .sellerId(sellerEmail)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .price(request.getPrice())
                .commissionRate(commissionRate)
                .totalWithCommission(totalWithCommission)
                .status(ListingStatus.ACTIVE)
                .category(request.getCategory())
                .images(request.getImages() != null ? request.getImages() : List.of())
                .averageRating(0.0)
                .ratingCount(0)
                .createdAt(now)
                .updatedAt(now)
                .expiresAt(now.plusDays(90)) // US-059 : expiration après 90 jours
                .build();

        return listingRepository.save(listing);
    }

    /**
     * Retourne le taux de commission selon le type d'annonce
     * US-056 : Gestion des commissions
     */
    private Double getCommissionRate(ListingType type) {
        return switch (type) {
            case SALE -> 0.05;      // 5% pour la vente
            case RENTAL -> 0.10;    // 10% pour la location
            case SERVICE -> 0.15;   // 15% pour les services
        };
    }

    /**
     * Recherche d'annonces avec filtres
     * US-057 : Recherche d'annonces
     */
    public List<Listing> searchListings(String type, String category, String keyword) {
        ListingStatus activeStatus = ListingStatus.ACTIVE;

        // Filtre par type
        if (type != null && !type.isEmpty()) {
            ListingType listingType = ListingType.valueOf(type.toUpperCase());
            if (category != null && !category.isEmpty()) {
                // Filtre par type ET catégorie
                return listingRepository.findByTypeAndCategoryAndStatus(listingType, category, activeStatus);
            }
            return listingRepository.findByTypeAndStatus(listingType, activeStatus);
        }

        // Filtre par catégorie uniquement
        if (category != null && !category.isEmpty()) {
            return listingRepository.findByCategoryAndStatus(category, activeStatus);
        }

        // Filtre par mot-clé
        if (keyword != null && !keyword.isEmpty()) {
            return listingRepository.findByTitleContainingIgnoreCaseAndStatus(keyword, activeStatus);
        }

        // Aucun filtre : retourne toutes les annonces actives
        return listingRepository.findByStatus(ListingStatus.ACTIVE);
    }

    /**
     * Récupère une annonce par son ID
     */
    public Listing getListingById(String id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable : " + id));
    }

    /**
     * Récupère toutes les annonces d'un vendeur
     * US-060 : Voir mes annonces
     */
    public List<Listing> getMyListings(String sellerEmail) {
        return listingRepository.findBySellerId(sellerEmail);
    }

    /**
     * Réserve une annonce (passe le statut à RESERVED)
     * US-061 : Réserver une annonce
     */
    public Listing reserveListing(String listingId, String buyerEmail) {
        Listing listing = getListingById(listingId);

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new RuntimeException("Cette annonce n'est pas disponible à la réservation");
        }

        // Vérification que l'acheteur n'est pas le vendeur
        if (listing.getSellerId().equals(buyerEmail)) {
            throw new RuntimeException("Vous ne pouvez pas réserver votre propre annonce");
        }

        listing.setStatus(ListingStatus.RESERVED);
        listing.setUpdatedAt(LocalDateTime.now());

        return listingRepository.save(listing);
    }

    /**
     * Clôture une annonce (passe le statut à CLOSED)
     * Seul le vendeur peut clôturer son annonce
     * US-062 : Clôturer une annonce
     */
    public Listing closeListing(String listingId, String sellerEmail) {
        Listing listing = getListingById(listingId);

        if (!listing.getSellerId().equals(sellerEmail)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à clôturer cette annonce");
        }

        listing.setStatus(ListingStatus.CLOSED);
        listing.setUpdatedAt(LocalDateTime.now());

        return listingRepository.save(listing);
    }

    /**
     * Note une annonce et recalcule la moyenne
     * US-064 : Noter une annonce
     */
    public Listing rateListing(String listingId, Double rating, String reviewerEmail) {
        Listing listing = getListingById(listingId);

        // Validation de la note (1 à 5)
        if (rating < 1.0 || rating > 5.0) {
            throw new RuntimeException("La note doit être entre 1 et 5");
        }

        // Vérification que le reviewer n'est pas le vendeur
        if (listing.getSellerId().equals(reviewerEmail)) {
            throw new RuntimeException("Vous ne pouvez pas noter votre propre annonce");
        }

        // Recalcul de la moyenne
        Integer oldRatingCount = listing.getRatingCount() != null ? listing.getRatingCount() : 0;
        Double oldAverageRating = listing.getAverageRating() != null ? listing.getAverageRating() : 0.0;

        Integer newRatingCount = oldRatingCount + 1;
        Double newAverageRating = ((oldAverageRating * oldRatingCount) + rating) / newRatingCount;

        listing.setRatingCount(newRatingCount);
        listing.setAverageRating(newAverageRating);
        listing.setUpdatedAt(LocalDateTime.now());

        return listingRepository.save(listing);
    }

    /**
     * Expire automatiquement les annonces anciennes
     * US-059 : Expiration automatique des annonces
     * S'exécute tous les jours à minuit (0 0 0 * * *)
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void expireOldListings() {
        List<Listing> expiredListings = listingRepository.findByExpiresAtBefore(LocalDateTime.now());

        for (Listing listing : expiredListings) {
            if (listing.getStatus() == ListingStatus.ACTIVE) {
                listing.setStatus(ListingStatus.EXPIRED);
                listing.setUpdatedAt(LocalDateTime.now());
                listingRepository.save(listing);
            }
        }

        System.out.println("Expiration des annonces : " + expiredListings.size() + " annonces expirées");
    }
}
