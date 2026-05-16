package com.example.coplaybackend.Repositories.Competitions;

import com.example.coplaybackend.Entities.Competitions.Enums.TicketStatus;
import com.example.coplaybackend.Entities.Competitions.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByMatchId(String matchId);

    List<Ticket> findByMatchIdAndStatus(String matchId, TicketStatus status);

    List<Ticket> findByBuyerEmail(String buyerEmail);
}