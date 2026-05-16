package com.example.coplaybackend.Entities.Marketplace;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Document(collection = "marketplace_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceService {

    @Id
    private String serviceId;

    private String providerId;       // ref → User (sémantiquement le coachId quand category=COACHING_SESSION)

    private String name;

    private BigDecimal price;

    private String description;

    private String category;         // "COACHING_SESSION", "PHYSIO", "NUTRITION", etc.

    private String status;           // "DRAFT", "PUBLISHED", "ARCHIVED"
}
