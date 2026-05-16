package com.example.coplaybackend.Services.Marketplace;

import java.math.BigDecimal;
import java.util.List;

public interface MarketplaceProductService {

    com.example.coplaybackend.Entities.Marketplace.MarketplaceService create(
            String providerId, String name, String description, BigDecimal price, String category);

    com.example.coplaybackend.Entities.Marketplace.MarketplaceService createDraftForCoach(String coachId);

    com.example.coplaybackend.Entities.Marketplace.MarketplaceService publish(String serviceId);

    com.example.coplaybackend.Entities.Marketplace.MarketplaceService archive(String serviceId);

    com.example.coplaybackend.Entities.Marketplace.MarketplaceService getById(String serviceId);

    List<com.example.coplaybackend.Entities.Marketplace.MarketplaceService> listAll();

    List<com.example.coplaybackend.Entities.Marketplace.MarketplaceService> listByProvider(String providerId);

    List<com.example.coplaybackend.Entities.Marketplace.MarketplaceService> listByCategory(String category);
}
