package com.example.coplaybackend.Repositories.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByBuyerId(String buyerId);

    List<Order> findByTargetIdAndTargetType(String targetId, String targetType);

    List<Order> findByStatus(String status);
}
