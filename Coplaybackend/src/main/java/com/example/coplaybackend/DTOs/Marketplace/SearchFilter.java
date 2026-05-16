package com.example.coplaybackend.DTOs.Marketplace;

import lombok.Data;

@Data
public class SearchFilter {
    private String q;            // free text
    private String sport;
    private String category;
    private String condition;
    private Double minPrice;
    private Double maxPrice;
    private String city;
    private Double lat;
    private Double lng;
    private Double radiusKm;
    private String sortBy;       // price_asc, price_desc, rating, popularity, recent
    private Integer page;
    private Integer size;
}
