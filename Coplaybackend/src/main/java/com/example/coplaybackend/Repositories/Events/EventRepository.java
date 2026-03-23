package com.example.coplaybackend.Repositories.Events;

import com.example.coplaybackend.Entities.Events.Event;
import com.example.coplaybackend.Entities.Events.EventStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {

    List<Event> findByTeamId(String teamId);

    List<Event> findByTeamIdAndStatus(String teamId, EventStatus status);

    List<Event> findByIsPublicTrueAndStartDateAfter(LocalDateTime date);
}