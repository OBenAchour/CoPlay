package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    private String bookingId;

    @Indexed
    private String clientId;

    @Indexed
    private String providerId;

    @Indexed
    private String targetId;

    private String targetType;       // SERVICE / EQUIPMENT_RENT / COACH_SESSION

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private BigDecimal totalPrice;
    private String currency;

    @Indexed
    @Builder.Default
    private String status = "PENDING"; // PENDING / CONFIRMED / COMPLETED / CANCELLED

    private String paymentIntentId;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
