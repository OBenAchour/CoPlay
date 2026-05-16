package com.example.coplaybackend.DTOs.Marketplace;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class EquipmentRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal rentalPricePerDay;
    private String category;
    private String sport;
    private String brand;
    private String condition;
    private String listingType;
    private List<String> tags;
    private String city;
    private Double latitude;
    private Double longitude;
    private Integer quantity;
}
