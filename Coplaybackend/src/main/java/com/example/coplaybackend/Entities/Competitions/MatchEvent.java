package com.example.coplaybackend.Entities.Competitions;

import com.example.coplaybackend.Entities.Auth.User;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalTime;

@Document(collection = "match_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchEvent {

    @Id
    private String id;

    private Integer minute;

    // buteur
    @DBRef
    private User player;

    private String type; // ex: "GOAL", "ASSIST", "YELLOW_CARD"
}

