package com.example.coplaybackend.Entities.Events;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Document(collection = "locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    @Id
    private String locationId;

    private String name;

    private String address;

    private BigDecimal latitude;

    private BigDecimal longitude;
}
