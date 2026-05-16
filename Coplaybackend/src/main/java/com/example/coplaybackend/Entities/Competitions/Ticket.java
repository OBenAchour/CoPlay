package com.example.coplaybackend.Entities.Competitions;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Competitions.Enums.TicketStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    private String id;

    @DBRef
    private MatchCompetition match;      // Le match concerné

    @DBRef
    private User buyer;                  // Qui a acheté (null si disponible)
    // ✅ AJOUT : email stocké directement pour faciliter la recherche
    private String buyerEmail;
    private String ticketNumber;         // Ex: "TKT-0001"
    private String category;             // "VIP", "TRIBUNE", "PELOUSE"
    private Double price;                // Prix en dinars
    private TicketStatus status;         // AVAILABLE / SOLD / CANCELLED
    private LocalDateTime purchasedAt;   // Date d'achat
    private String seatNumber;           // Ex: "A-12"
}