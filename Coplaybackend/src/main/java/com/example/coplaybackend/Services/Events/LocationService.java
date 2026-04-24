package com.example.coplaybackend.Services.Events;

import com.example.coplaybackend.Entities.Events.Location;
import com.example.coplaybackend.Repositories.Events.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * LocationService — gestion des lieux + intégration Google Maps Geocoding API.
 *
 * Ce service est responsable de :
 *  1. Créer / lister / chercher des locations
 *  2. Convertir une adresse en coordonnées GPS via Google Maps (Geocoding)
 *  3. Générer un lien Google Maps cliquable pour chaque location
 *
 * Fonctionnement du Geocoding :
 *  Capitaine tape "Terrain El Menzah, Tunis"
 *  → Appel API Google Maps Geocoding
 *  → Google retourne latitude + longitude
 *  → Location créée automatiquement avec les coordonnées
 */
@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;

    private static final String GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

    // ═══════════════════════════════════════════════════════════════
    //  1. GESTION DES LOCATIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Crée une location manuellement (avec coordonnées déjà connues).
     */
    public Location createLocation(Location location) {
        return locationRepository.save(location);
    }

    /**
     * Retourne toutes les locations.
     */
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    /**
     * Retourne une location par son ID.
     */
    public Location getLocationById(String locationId) {
        return locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location introuvable : " + locationId));
    }

    /**
     * Recherche des locations par nom (autocomplétion).
     */
    public List<Location> searchByName(String name) {
        return locationRepository.findByNameContainingIgnoreCase(name);
    }

    // ═══════════════════════════════════════════════════════════════
    //  2. GOOGLE MAPS GEOCODING
    // ═══════════════════════════════════════════════════════════════

    /**
     * Convertit une adresse en coordonnées GPS et crée la Location automatiquement.
     *
     * Exemple :
     *  Input  : "Terrain El Menzah, Tunis"
     *  Output : Location { name: "Terrain El Menzah, Tunis",
     *                      address: "Tunis, Tunisie",
     *                      latitude: 36.8065,
     *                      longitude: 10.1815 }
     *
     * Fonctionnement :
     *  1. Appel à l'API Google Maps Geocoding avec l'adresse
     *  2. Google retourne un JSON avec les coordonnées
     *  3. On extrait latitude + longitude
     *  4. On crée et sauvegarde la Location
     */
    public Location createLocationFromAddress(String address) {
        // Appel à l'API Google Maps Geocoding
        Map response = webClientBuilder.build()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("maps.googleapis.com")
                        .path("/maps/api/geocode/json")
                        .queryParam("address", address)
                        .queryParam("key", googleMapsApiKey)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        // Vérification que Google a trouvé des résultats
        List results = (List) response.get("results");
        if (results == null || results.isEmpty()) {
            throw new RuntimeException("Adresse introuvable sur Google Maps : " + address);
        }

        // Extraction des coordonnées depuis la réponse Google
        Map firstResult  = (Map) results.get(0);
        Map geometry     = (Map) firstResult.get("geometry");
        Map location     = (Map) geometry.get("location");
        String formattedAddress = (String) firstResult.get("formatted_address");

        Double lat = (Double) location.get("lat");
        Double lng = (Double) location.get("lng");

        // Création de la Location avec les coordonnées trouvées
        Location newLocation = Location.builder()
                .name(address)
                .address(formattedAddress)
                .latitude(BigDecimal.valueOf(lat))
                .longitude(BigDecimal.valueOf(lng))
                .build();

        return locationRepository.save(newLocation);
    }

    // ═══════════════════════════════════════════════════════════════
    //  3. LIEN GOOGLE MAPS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Génère un lien Google Maps cliquable pour une location.
     *
     * Exemple de lien généré :
     *  https://maps.google.com/?q=36.8065,10.1815
     *
     * Le joueur clique → Google Maps s'ouvre directement sur le lieu. ✅
     */
    public String getGoogleMapsLink(String locationId) {
        Location location = getLocationById(locationId);

        return "https://maps.google.com/?q="
                + location.getLatitude()
                + ","
                + location.getLongitude();
    }
}