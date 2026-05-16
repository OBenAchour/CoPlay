package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Order;

import java.util.List;

public interface OrderService {

    Order create(String buyerId, String targetId, String targetType);

    /**
     * Mark the order as PAID. If targetType=SERVICE and the service category is
     * COACHING_SESSION, a CoachingSession is auto-created and linked.
     */
    Order markPaid(String orderId);

    Order cancel(String orderId);

    Order complete(String orderId);

    Order getById(String orderId);

    List<Order> listByBuyer(String buyerId);

    List<Order> listByTarget(String targetId, String targetType);
}
