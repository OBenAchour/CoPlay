package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.ServiceRequest;
import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import com.example.coplaybackend.Repositories.Marketplace.MarketplaceServiceRepository;
import com.example.coplaybackend.Services.Messaging.FileStorageService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProviderServiceService {

    private final MarketplaceServiceRepository repo;
    private final FileStorageService fileStorageService;

    public MarketplaceService create(ServiceRequest req) {
        String providerId = SecurityUtils.getCurrentUserId();
        MarketplaceService s = MarketplaceService.builder()
                .providerId(providerId)
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .pricingModel(req.getPricingModel() != null ? req.getPricingModel() : "HOURLY")
                .category(req.getCategory())
                .sport(req.getSport())
                .certifications(req.getCertifications() != null ? req.getCertifications() : new ArrayList<>())
                .availability(req.getAvailability() != null ? req.getAvailability() : new ArrayList<>())
                .radiusKm(req.getRadiusKm())
                .city(req.getCity())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return repo.save(s);
    }

    public MarketplaceService update(String serviceId, ServiceRequest req) {
        MarketplaceService s = getById(serviceId);
        ensureOwner(s.getProviderId());
        if (req.getName() != null) s.setName(req.getName());
        if (req.getDescription() != null) s.setDescription(req.getDescription());
        if (req.getPrice() != null) s.setPrice(req.getPrice());
        if (req.getPricingModel() != null) s.setPricingModel(req.getPricingModel());
        if (req.getCategory() != null) s.setCategory(req.getCategory());
        if (req.getSport() != null) s.setSport(req.getSport());
        if (req.getCertifications() != null) s.setCertifications(req.getCertifications());
        if (req.getAvailability() != null) s.setAvailability(req.getAvailability());
        if (req.getRadiusKm() != null) s.setRadiusKm(req.getRadiusKm());
        if (req.getCity() != null) s.setCity(req.getCity());
        if (req.getLatitude() != null) s.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) s.setLongitude(req.getLongitude());
        s.setUpdatedAt(LocalDateTime.now());
        return repo.save(s);
    }

    public void delete(String serviceId) {
        MarketplaceService s = getById(serviceId);
        ensureOwner(s.getProviderId());
        s.setDeleted(true);
        s.setStatus("INACTIVE");
        s.setUpdatedAt(LocalDateTime.now());
        repo.save(s);
    }

    public MarketplaceService getById(String serviceId) {
        return repo.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service introuvable : " + serviceId));
    }

    public Page<MarketplaceService> list(int page, int size) {
        return repo.findByDeletedFalse(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public List<MarketplaceService> listByProvider(String providerId) {
        return repo.findByProviderIdAndDeletedFalse(providerId);
    }

    public MarketplaceService uploadImage(String serviceId, MultipartFile file) throws IOException {
        MarketplaceService s = getById(serviceId);
        ensureOwner(s.getProviderId());
        String ref = fileStorageService.storeFile(file);
        s.getImages().add(ref);
        s.setUpdatedAt(LocalDateTime.now());
        return repo.save(s);
    }

    public List<MarketplaceService> findNearby(double lat, double lng, double radiusKm, String sport) {
        // Simple in-memory haversine filter (works fine until you add a 2dsphere index).
        List<MarketplaceService> all = sport != null
                ? repo.findBySportAndDeletedFalse(sport, PageRequest.of(0, 500)).getContent()
                : repo.findByDeletedFalse(PageRequest.of(0, 500)).getContent();
        return all.stream()
                .filter(s -> s.getLatitude() != null && s.getLongitude() != null)
                .filter(s -> haversine(lat, lng, s.getLatitude(), s.getLongitude()) <= radiusKm)
                .toList();
    }

    public void recomputeRating(String serviceId, double avg, int count) {
        MarketplaceService s = getById(serviceId);
        s.setRating(avg);
        s.setReviewCount(count);
        repo.save(s);
    }

    private void ensureOwner(String providerId) {
        String me = SecurityUtils.getCurrentUserId();
        if (me == null || !me.equals(providerId)) {
            throw new RuntimeException("Action interdite : non propriétaire");
        }
    }

    private static double haversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * R * Math.asin(Math.sqrt(a));
    }
}
