package com.example.coplaybackend.Controllers.Competitions;

import com.example.coplaybackend.DTOs.Competitions.BuyTicketRequest;
import com.example.coplaybackend.DTOs.Competitions.CreateTicketsRequest;
import com.example.coplaybackend.DTOs.Competitions.TicketDTO;
import com.example.coplaybackend.Services.Competitions.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TicketController {

    private final TicketService ticketService;

    // Générer les tickets pour un match (admin)
    @PostMapping("/match/{matchId}/generate")
    public ResponseEntity<?> generateTickets(
            @PathVariable String matchId,
            @RequestBody CreateTicketsRequest request) {
        try {
            return ResponseEntity.ok(
                    ticketService.createTicketsForMatch(matchId, request));
        } catch (IllegalStateException e) {
            // ✅ Retourne 400 si le match est terminé
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Voir tous les tickets d'un match
    @GetMapping("/match/{matchId}")
    public ResponseEntity<List<TicketDTO>> getMatchTickets(
            @PathVariable String matchId) {
        return ResponseEntity.ok(ticketService.getTicketsByMatch(matchId));
    }

    // Voir uniquement les tickets disponibles d'un match
    @GetMapping("/match/{matchId}/available")
    public ResponseEntity<List<TicketDTO>> getAvailableTickets(
            @PathVariable String matchId) {
        return ResponseEntity.ok(ticketService.getAvailableTickets(matchId));
    }

    // Acheter un ticket
    @PostMapping("/buy")
    public ResponseEntity<?> buyTicket(@RequestBody BuyTicketRequest request) {
        try {
            return ResponseEntity.ok(
                    ticketService.buyTicketByEmail(
                            request.getTicketId(),
                            request.getBuyerEmail()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Voir mes tickets achetés
    @GetMapping("/my-tickets/{email}")
    public ResponseEntity<List<TicketDTO>> getMyTickets(
            @PathVariable String email) {
        return ResponseEntity.ok(ticketService.getMyTicketsByEmail(email));
    }
}