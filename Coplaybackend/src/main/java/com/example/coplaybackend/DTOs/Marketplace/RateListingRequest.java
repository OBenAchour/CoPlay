package com.example.coplaybackend.DTOs.Marketplace;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour noter une annonce
 * US-064 : Noter une annonce
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateListingRequest {

    /**
     * Note de 1 à 5
     */
    private Double rating;
}
