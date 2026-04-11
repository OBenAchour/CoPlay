package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.CreateListingRequest;
import com.example.coplaybackend.DTOs.Marketplace.ListingResponse;
import com.example.coplaybackend.DTOs.Marketplace.RateListingRequest;
import com.example.coplaybackend.Entities.Marketplace.Listing;
import com.example.coplaybackend.Entities.Marketplace.ListingStatus;
import com.example.coplaybackend.Services.Marketplace.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller pour la gestion des annonces du marketplace
 * US-055 : Création d'annonce
 * US-056 : Gestion des commissions
 * US-057 : Recherche d'annonces
 * US-059 : Expiration automatique
 * US-060 : Voir mes annonces
 * US-061 : Réserver une annonce
 * US-062 : Clôturer une annonce
 * US-064 : Noter une annonce
 */
@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ListingController {

    private final ListingService listingService;

    // ═══════════════════════════════════════════════════════════════
    //  CRÉATION ET AFFICHAGE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Crée une nouvelle annonce
     * POST /api/listings
     * US-055, US-056, US-059
     */
    @PostMapping
    public ResponseEntity<Listing> createListing(
            @RequestBody CreateListingRequest request,
            Authentication authentication) {

        String sellerEmail = authentication.getName();
        Listing createdListing = listingService.createListing(request, sellerEmail);
        return ResponseEntity.status(201).body(createdListing);
    }

    /**
     * Recherche d'annonces (public)
     * GET /api/listings?type=SALE&category=FOOTBALL&keyword=ballon
     * US-057 : Recherche d'annonces
     */
    @GetMapping
    public ResponseEntity<List<Listing>> searchListings(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {

        List<Listing> listings = listingService.searchListings(type, category, keyword);
        return ResponseEntity.ok(listings);
    }

    /**
     * Récupère une annonce par son ID (public)
     * GET /api/listings/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Listing> getListingById(@PathVariable String id) {
        Listing listing = listingService.getListingById(id);
        return ResponseEntity.ok(listing);
    }

    /**
     * Récupère toutes les annonces de l'utilisateur connecté
     * GET /api/listings/my
     * US-060 : Voir mes annonces
     */
    @GetMapping("/my")
    public ResponseEntity<List<Listing>> getMyListings(Authentication authentication) {
        String sellerEmail = authentication.getName();
        List<Listing> listings = listingService.getMyListings(sellerEmail);
        return ResponseEntity.ok(listings);
    }

    // ═══════════════════════════════════════════════════════════════
    //  RÉSERVATION ET CLÔTURE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Réserve une annonce (acheteur connecté)
     * POST /api/listings/{id}/reserve
     * US-061 : Réserver une annonce
     */
    @PostMapping("/{id}/reserve")
    public ResponseEntity<Listing> reserveListing(
            @PathVariable String id,
            Authentication authentication) {

        String buyerEmail = authentication.getName();
        Listing listing = listingService.reserveListing(id, buyerEmail);
        return ResponseEntity.ok(listing);
    }

    /**
     * Clôture une annonce (vendeur connecté)
     * POST /api/listings/{id}/close
     * US-062 : Clôturer une annonce
     */
    @PostMapping("/{id}/close")
    public ResponseEntity<Listing> closeListing(
            @PathVariable String id,
            Authentication authentication) {

        String sellerEmail = authentication.getName();
        Listing listing = listingService.closeListing(id, sellerEmail);
        return ResponseEntity.ok(listing);
    }

    // ═══════════════════════════════════════════════════════════════
    //  NOTATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Note une annonce
     * POST /api/listings/{id}/rate
     * US-064 : Noter une annonce
     */
    @PostMapping("/{id}/rate")
    public ResponseEntity<Listing> rateListing(
            @PathVariable String id,
            @RequestBody RateListingRequest request,
            Authentication authentication) {

        String reviewerEmail = authentication.getName();
        Listing listing = listingService.rateListing(id, request.getRating(), reviewerEmail);
        return ResponseEntity.ok(listing);
    }

    // ═══════════════════════════════════════════════════════════════
    //  STATISTIQUES (optionnelles)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Récupère les annonces actives (public)
     * GET /api/listings/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<Listing>> getActiveListings() {
        List<Listing> listings = listingService.searchListings(null, null, null);
        return ResponseEntity.ok(listings);
    }

    /**
     * Vérifie si une annonce est disponible
     * GET /api/listings/{id}/status
     */
    @GetMapping("/{id}/status")
    public ResponseEntity<ListingStatus> getListingStatus(@PathVariable String id) {
        Listing listing = listingService.getListingById(id);
        return ResponseEntity.ok(listing.getStatus());
    }
}
