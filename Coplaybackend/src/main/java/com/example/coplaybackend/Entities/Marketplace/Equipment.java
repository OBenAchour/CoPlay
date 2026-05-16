package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.List;

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
    private String description;

    private BigDecimal price;

    private String category;
    private String status;           // "AVAILABLE", "SOLD", "RESERVED"

    private Integer stock;
    private List<String> images;
}
