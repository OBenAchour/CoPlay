package com.example.coplaybackend.Entities.Competitions;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "matches")
public class Match {

    @Id
    private String id;
    private String teamA;
    private String teamB;
    private int scoreA;
    private int scoreB;
    private LocalDateTime date;
}
