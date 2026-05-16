package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    private String targetId;        // equipmentId or serviceId
    private String targetType;      // EQUIPMENT / SERVICE
    private String name;            // snapshot
    private String imageUrl;        // snapshot
    private Integer quantity;
    private BigDecimal unitPrice;
    private String sellerId;        // for split-fulfillment
}
