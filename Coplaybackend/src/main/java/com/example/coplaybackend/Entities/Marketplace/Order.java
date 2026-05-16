package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    private String orderId;

    @Indexed
    private String buyerId;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    private BigDecimal totalAmount;
    private String currency;

    @Indexed
    @Builder.Default
    private String status = "PENDING";   // PENDING / PAID / SHIPPED / DELIVERED / CANCELLED / REFUNDED

    private String paymentMethod;        // STRIPE / CASH
    private String paymentIntentId;

    private ShippingAddress shippingAddress;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShippingAddress {
        private String fullName;
        private String phone;
        private String line1;
        private String line2;
        private String city;
        private String postalCode;
        private String country;
    }
}
