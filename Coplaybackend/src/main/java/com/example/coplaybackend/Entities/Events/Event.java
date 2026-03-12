package com.example.coplaybackend.Entities.Events;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    private String eventId;

    private String teamId;           // ref → Team

    private String title;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String locationId;       // ref → Location

    private EventStatus status;

    private Boolean isPublic = true;

    private List<String> attendeeIds; // ref → User[]
}
