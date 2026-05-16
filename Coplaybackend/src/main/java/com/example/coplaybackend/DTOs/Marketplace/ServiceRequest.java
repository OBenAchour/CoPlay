package com.example.coplaybackend.DTOs.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ServiceRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String pricingModel;
    private String category;
    private String sport;
    private List<String> certifications;
    private List<MarketplaceService.TimeSlot> availability;
    private Double radiusKm;
    private String city;
    private Double latitude;
    private Double longitude;
}
