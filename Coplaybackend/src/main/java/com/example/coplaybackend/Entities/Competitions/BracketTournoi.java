package com.example.coplaybackend.Entities.Competitions;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "bracket_tournoi")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BracketTournoi {

    @Id
    private String id;

    @Indexed
    private String competitionId;

    private Integer round;

    private String phase;

    private List<String> matchIds;

    private LocalDateTime dateLimite;

    private Boolean estComplete;

    @Builder.Default
    private Boolean estTire = false;
}
