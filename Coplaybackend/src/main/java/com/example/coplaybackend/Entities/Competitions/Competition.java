package com.example.coplaybackend.Entities.Competitions;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionStatus;
import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "competitions")
@Data // Génère les getters/setters
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "type",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = Ligue.class, name = "LEAGUE"),
        @JsonSubTypes.Type(value = Tournoi.class, name = "TOURNAMENT")
})
public abstract class Competition {
    @Id
    private String id;

    private String name;

    private String sport;

    // --- RE-AJOUT DES CHAMPS POUR FIXER LA COMPILATION ---
    private LocalDate startDate;

    private LocalDate endDate;

    private CompetitionStatus status;

    private CompetitionType type;

    private Integer maxTeams;
    // ----------------------------------------------------

    @DBRef
    private User creator;

    @JsonIgnore // Empêche la boucle infinie et l'erreur 500
    @DBRef
    private List<Journee> journees;
}