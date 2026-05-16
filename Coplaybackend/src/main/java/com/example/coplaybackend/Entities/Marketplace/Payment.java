package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    private String paymentId;

    @Indexed
    private String orderId;

    @Indexed
    private String bookingId;

    @Indexed
    private String userId;

    private BigDecimal amount;
    private String currency;

    @Builder.Default
    private String provider = "STRIPE";

    @Indexed
    private String providerRef;       // Stripe paymentIntentId

    @Indexed
    @Builder.Default
    private String status = "PENDING"; // PENDING / SUCCEEDED / FAILED / REFUNDED

    private String failureReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
