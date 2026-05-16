package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {
    private String targetId;
    private String targetType;     // EQUIPMENT / SERVICE
    private Integer quantity;
    private BigDecimal unitPrice;  // snapshot
    private String name;           // snapshot
    private String imageUrl;       // snapshot
}
