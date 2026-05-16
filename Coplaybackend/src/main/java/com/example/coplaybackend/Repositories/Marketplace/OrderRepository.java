package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    Page<Order> findByBuyerId(String buyerId, Pageable pageable);

    @Query("{ 'items.sellerId': ?0 }")
    Page<Order> findBySellerId(String sellerId, Pageable pageable);

    Optional<Order> findByPaymentIntentId(String paymentIntentId);

    List<Order> findByBuyerIdAndStatus(String buyerId, String status);

    @Query("{ 'buyerId': ?0, 'items.targetId': ?1, 'status': 'PAID' }")
    List<Order> findPaidByBuyerAndTarget(String buyerId, String targetId);
}
