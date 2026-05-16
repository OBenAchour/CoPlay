package com.example.coplaybackend.DTOs.Marketplace;

import lombok.Data;

@Data
public class PaymentIntentRequest {
    private String orderId;
    private String bookingId;
}
