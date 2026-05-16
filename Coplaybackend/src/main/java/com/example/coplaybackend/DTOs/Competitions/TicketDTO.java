package com.example.coplaybackend.DTOs.Competitions;

import com.example.coplaybackend.Entities.Competitions.Enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketDTO {
    private String id;
    private String matchId;

    // ✅ Infos du match pour affichage
    private String matchDate;
    private String teamA;
    private String teamB;

    private String ticketNumber;
    private String category;
    private Double price;
    private TicketStatus status;
    private String seatNumber;

    // ✅ Nom du détenteur du billet
    private String buyerName;
    private String buyerEmail;

    private LocalDateTime purchasedAt;
}