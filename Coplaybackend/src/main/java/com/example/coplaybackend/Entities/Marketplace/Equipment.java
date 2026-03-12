package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Document(collection = "equipments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {

    @Id
    private String equipmentId;

    private String sellerId;         // ref → User

    private String name;

    private BigDecimal price;

    private String category;

    private String status;           // "AVAILABLE", "SOLD", "RESERVED"
}
