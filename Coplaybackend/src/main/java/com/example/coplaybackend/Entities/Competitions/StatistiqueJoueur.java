package com.example.coplaybackend.Entities.Competitions;

import com.example.coplaybackend.Entities.Auth.User;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "statistiques_joueurs")
@CompoundIndex(name = "unique_player_stat",
        def = "{\"joueur.$id\": 1, \"competitionId\": 1}",
        unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatistiqueJoueur {

    @Id
    private String id;

    @DBRef
    private User joueur;

    private String competitionId;

    private Integer matchsJoues;

    private Integer titularisations;

    private Integer minutesJouees;

    private Integer buts;

    private Integer passesDecisives;

    private Integer cartonsJaunes;

    private Integer cartonsRouges;

    private Integer penaltyMarques;

    private Integer penaltyRates;

    private Integer cleanSheets;

    private Integer butsEncaisses;

    private Integer elo;

    private Integer etoiles;

    public Integer getPoints() {
        return (buts != null ? buts * 10 : 0) +
               (passesDecisives != null ? passesDecisives * 5 : 0) +
               (cleanSheets != null ? cleanSheets * 3 : 0);
    }
}
