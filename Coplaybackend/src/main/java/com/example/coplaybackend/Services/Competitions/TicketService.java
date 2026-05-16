package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.DTOs.Competitions.CreateTicketsRequest;
import com.example.coplaybackend.DTOs.Competitions.TicketDTO;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Competitions.MatchCompetition;
import com.example.coplaybackend.Entities.Competitions.Ticket;
import com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus;
import com.example.coplaybackend.Entities.Competitions.Enums.TicketStatus;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Competitions.MatchCompetitionRepository;
import com.example.coplaybackend.Repositories.Competitions.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final MatchCompetitionRepository matchRepository;
    private final UserRepository userRepository;

    // -------------------------------------------------------
    // Générer les tickets pour un match (admin)
    // ✅ Bloqué si le match est FINISHED ou CANCELLED
    // -------------------------------------------------------
    public List<TicketDTO> createTicketsForMatch(String matchId,
                                                 CreateTicketsRequest request) {

        MatchCompetition match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Match non trouvé : " + matchId));

        // ✅ CORRIGÉ : FINISHED et CANCELLED au lieu de PLAYED/VALIDATED
        if (match.getStatus() == MatchStatus.FINISHED
                || match.getStatus() == MatchStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Impossible de générer des tickets pour un match "
                            + match.getStatus());
        }

        // ✅ Vérifier si des tickets existent déjà pour ce match
        List<Ticket> existing = ticketRepository.findByMatchId(matchId);
        if (!existing.isEmpty()) {
            throw new IllegalStateException(
                    "Des tickets existent déjà pour ce match ("
                            + existing.size() + " tickets)");
        }

        List<Ticket> tickets = new ArrayList<>();
        tickets.addAll(generateTickets(match, "VIP",
                request.getVipCount(), request.getVipPrice()));
        tickets.addAll(generateTickets(match, "TRIBUNE",
                request.getTribuneCount(), request.getTribunePrice()));
        tickets.addAll(generateTickets(match, "PELOUSE",
                request.getPelouseCount(), request.getPelousePrice()));

        return ticketRepository.saveAll(tickets)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // Générer une liste de tickets pour une catégorie
    // -------------------------------------------------------
    private List<Ticket> generateTickets(MatchCompetition match,
                                         String category, int count, double price) {

        List<Ticket> list = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            String seatNumber = category.charAt(0)
                    + "-" + String.format("%03d", i);
            String ticketNumber = "TKT-" + category.substring(0, 1)
                    + "-" + match.getId().substring(0, 4).toUpperCase()
                    + "-" + String.format("%03d", i);

            list.add(Ticket.builder()
                    .match(match)
                    .category(category)
                    .price(price)
                    .status(TicketStatus.AVAILABLE)
                    .seatNumber(seatNumber)
                    .ticketNumber(ticketNumber)
                    .build());
        }
        return list;
    }

    // -------------------------------------------------------
    // Tous les tickets d'un match
    // -------------------------------------------------------
    public List<TicketDTO> getTicketsByMatch(String matchId) {
        return ticketRepository.findByMatchId(matchId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // Tickets disponibles d'un match
    // ✅ Bloqué si le match est FINISHED ou CANCELLED
    // -------------------------------------------------------
    public List<TicketDTO> getAvailableTickets(String matchId) {

        MatchCompetition match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Match non trouvé"));

        // ✅ CORRIGÉ : FINISHED et CANCELLED
        if (match.getStatus() == MatchStatus.FINISHED
                || match.getStatus() == MatchStatus.CANCELLED) {
            return List.of();
        }

        return ticketRepository
                .findByMatchIdAndStatus(matchId, TicketStatus.AVAILABLE)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // Acheter un ticket par EMAIL
    // ✅ Bloqué si le match est FINISHED ou CANCELLED
    // -------------------------------------------------------
    public TicketDTO buyTicketByEmail(String ticketId, String buyerEmail) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Ticket non trouvé"));

        // ✅ CORRIGÉ : FINISHED et CANCELLED
        MatchCompetition match = ticket.getMatch();
        if (match != null && (
                match.getStatus() == MatchStatus.FINISHED
                        || match.getStatus() == MatchStatus.CANCELLED)) {
            throw new IllegalStateException(
                    "Impossible d'acheter un ticket pour un match terminé");
        }

        if (ticket.getStatus() != TicketStatus.AVAILABLE) {
            throw new IllegalStateException(
                    "Ce ticket n'est plus disponible");
        }

        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur non trouvé : " + buyerEmail));

        ticket.setBuyer(buyer);
        ticket.setBuyerEmail(buyerEmail);
        ticket.setStatus(TicketStatus.SOLD);
        ticket.setPurchasedAt(LocalDateTime.now());

        return toDTO(ticketRepository.save(ticket));
    }

    // -------------------------------------------------------
    // Mes tickets par EMAIL
    // -------------------------------------------------------
    public List<TicketDTO> getMyTicketsByEmail(String email) {
        return ticketRepository.findByBuyerEmail(email)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // Convertir Ticket → TicketDTO
    // -------------------------------------------------------
    private TicketDTO toDTO(Ticket ticket) {

        String teamA = null;
        String teamB = null;
        String matchDate = null;

        if (ticket.getMatch() != null) {
            MatchCompetition m = ticket.getMatch();
            if (m.getEquipeA() != null) teamA = m.getEquipeA().getName();
            if (m.getEquipeB() != null) teamB = m.getEquipeB().getName();
            if (m.getDateMatch() != null) matchDate = m.getDateMatch().toString();
        }

        String buyerName = null;
        if (ticket.getBuyer() != null
                && ticket.getBuyer().getProfile() != null) {
            buyerName = ticket.getBuyer().getProfile().getDisplayName();
        }

        return TicketDTO.builder()
                .id(ticket.getId())
                .matchId(ticket.getMatch() != null
                        ? ticket.getMatch().getId() : null)
                .matchDate(matchDate)
                .teamA(teamA)
                .teamB(teamB)
                .ticketNumber(ticket.getTicketNumber())
                .category(ticket.getCategory())
                .price(ticket.getPrice())
                .status(ticket.getStatus())
                .seatNumber(ticket.getSeatNumber())
                .purchasedAt(ticket.getPurchasedAt())
                .buyerName(buyerName)
                .buyerEmail(ticket.getBuyerEmail())
                .build();
    }
}