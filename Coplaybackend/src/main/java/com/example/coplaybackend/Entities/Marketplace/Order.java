package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    private String orderId;

    private String buyerId;          // ref → User
    private String targetId;         // ref → Equipment or MarketplaceService
    private String targetType;       // "EQUIPMENT" or "SERVICE"

    private BigDecimal amount;
    private String status;           // "PENDING", "PAID", "CANCELLED", "COMPLETED"

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
