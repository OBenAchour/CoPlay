package com.example.coplaybackend.Entities.Competitions;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

/**
 * Classe abstraite — Tournoi et Ligue héritent d'elle.
 * MongoDB stocke tout dans la collection "competitions"
 * avec un champ "_class" qui discrimine le sous-type automatiquement.
 */
@Document(collection = "competitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class Competition {

    @Id
    private String competitionId;

    private String name;

    private String sport;

    private LocalDate startDate;

    private LocalDate endDate;

    private CompetitionStatus status;

    private Integer maxTeams;

    private String createdBy;        // ref → User
}

