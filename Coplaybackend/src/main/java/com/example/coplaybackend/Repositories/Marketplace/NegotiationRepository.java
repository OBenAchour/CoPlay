package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Negotiation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NegotiationRepository extends MongoRepository<Negotiation, String> {

    List<Negotiation> findByBuyerId(String buyerId);

    List<Negotiation> findBySellerId(String sellerId);

    Optional<Negotiation> findByTargetIdAndBuyerId(String targetId, String buyerId);
}
