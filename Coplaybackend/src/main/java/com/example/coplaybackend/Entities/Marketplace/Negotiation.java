package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "negotiations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Negotiation {

    @Id
    private String negotiationId;

    @Indexed
    private String targetId;

    private String targetType;     // EQUIPMENT / SERVICE

    @Indexed
    private String buyerId;

    @Indexed
    private String sellerId;

    private String conversationId;  // ref → Messaging Conversation

    private BigDecimal lastOfferedPrice;
    private String lastOfferBy;     // BUYER / SELLER

    @Indexed
    @Builder.Default
    private String status = "OPEN"; // OPEN / ACCEPTED / REJECTED / CLOSED

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
