package com.example.coplaybackend.DTOs.Competitions;

import lombok.Data;

@Data
public class BuyTicketRequest {
    private String ticketId;
    private String buyerEmail;  // ✅ email au lieu de buyerId
}