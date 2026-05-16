package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceServiceRepository extends MongoRepository<MarketplaceService, String> {

    Page<MarketplaceService> findByDeletedFalse(Pageable pageable);

    List<MarketplaceService> findByProviderIdAndDeletedFalse(String providerId);

    Page<MarketplaceService> findByCategoryAndDeletedFalse(String category, Pageable pageable);

    Page<MarketplaceService> findBySportAndDeletedFalse(String sport, Pageable pageable);

    @Query("{ 'deleted': false, '$text': { '$search': ?0 } }")
    Page<MarketplaceService> searchText(String text, Pageable pageable);
}
