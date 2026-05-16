package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MarketplaceServiceRepository extends MongoRepository<MarketplaceService, String> {

    List<MarketplaceService> findByProviderId(String providerId);

    List<MarketplaceService> findByCategory(String category);

    List<MarketplaceService> findByStatus(String status);
}
