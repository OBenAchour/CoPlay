package com.example.coplaybackend.DTOs.Competitions;

import lombok.Data;

@Data
public class CreateTicketsRequest {
    private int vipCount;        // Nombre de places VIP
    private double vipPrice;     // Prix VIP

    private int tribuneCount;    // Nombre de places Tribune
    private double tribunePrice; // Prix Tribune

    private int pelouseCount;    // Nombre de places Pelouse
    private double pelousePrice; // Prix Pelouse
}