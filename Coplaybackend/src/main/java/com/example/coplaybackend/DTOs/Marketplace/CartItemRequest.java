package com.example.coplaybackend.DTOs.Marketplace;

import lombok.Data;

@Data
public class CartItemRequest {
    private String targetId;
    private String targetType;
    private Integer quantity;
}
