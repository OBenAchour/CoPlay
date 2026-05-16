package com.example.coplaybackend.DTOs.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Order;
import lombok.Data;

@Data
public class OrderRequest {
    private Order.ShippingAddress shippingAddress;
    private String paymentMethod;
}
