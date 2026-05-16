package com.example.coplaybackend.DTOs.Marketplace;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class NegotiationRequest {
    private String targetId;
    private String targetType;
    private BigDecimal proposedPrice;
    private String message;
}
