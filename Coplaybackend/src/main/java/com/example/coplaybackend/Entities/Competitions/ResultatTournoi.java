package com.example.coplaybackend.Entities.Competitions;

import com.example.coplaybackend.Entities.Teams.Team;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resultats_tournoi")
@CompoundIndex(name = "unique_equipe_tournoi",
        def = "{\"equipeId\": 1, \"competitionId\": 1}",
        unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultatTournoi {

    @Id
    private String id;

    private String competitionId;

    private String equipeId;

    private Team equipe;

    private Integer positionFinale;

    private Integer matchsJoues;

    private Integer victoires;

    private Integer defaites;

    private Integer nuls;

    private Integer butsPour;

    private Integer butsContre;

    private Integer penaltiesGagnes;

    private Integer penaltiesPerdus;

    @Builder.Default
    private Boolean estElimine = false;

    private String eliminatedAtRound;
}
