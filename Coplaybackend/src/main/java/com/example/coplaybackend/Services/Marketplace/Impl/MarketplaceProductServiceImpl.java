package com.example.coplaybackend.Services.Marketplace.Impl;

import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import com.example.coplaybackend.Repositories.Marketplace.MarketplaceServiceRepository;
import com.example.coplaybackend.Services.Marketplace.MarketplaceProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketplaceProductServiceImpl implements MarketplaceProductService {

    private final MarketplaceServiceRepository repository;

    @Override
    public MarketplaceService create(String providerId, String name, String description,
                                     BigDecimal price, String category) {
        MarketplaceService s = MarketplaceService.builder()
                .providerId(providerId)
                .name(name)
                .description(description)
                .price(price)
                .category(category)
                .status("PUBLISHED")
                .build();
        return repository.save(s);
    }

    @Override
    public MarketplaceService createDraftForCoach(String coachId) {
        MarketplaceService s = MarketplaceService.builder()
                .providerId(coachId)
                .name("Coaching session")
                .description("Configure your coaching offer.")
                .price(BigDecimal.ZERO)
                .category("COACHING_SESSION")
                .status("DRAFT")
                .build();
        return repository.save(s);
    }

    @Override
    public MarketplaceService publish(String serviceId) {
        MarketplaceService s = repository.findById(serviceId).orElseThrow();
        s.setStatus("PUBLISHED");
        return repository.save(s);
    }

    @Override
    public MarketplaceService archive(String serviceId) {
        MarketplaceService s = repository.findById(serviceId).orElseThrow();
        s.setStatus("ARCHIVED");
        return repository.save(s);
    }

    @Override
    public MarketplaceService getById(String serviceId) {
        return repository.findById(serviceId).orElseThrow();
    }

    @Override
    public List<MarketplaceService> listAll() {
        return repository.findAll();
    }

    @Override
    public List<MarketplaceService> listByProvider(String providerId) {
        return repository.findByProviderId(providerId);
    }

    @Override
    public List<MarketplaceService> listByCategory(String category) {
        return repository.findByCategory(category);
    }
}
