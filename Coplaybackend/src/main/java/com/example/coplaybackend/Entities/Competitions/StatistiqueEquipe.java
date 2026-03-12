package com.example.coplaybackend.Entities.Competitions;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "statistiques_equipe")
@CompoundIndex(name = "unique_stat",
        def = "{'teamId': 1, 'competitionId': 1}",
        unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatistiqueEquipe {

    @Id
    private String id;

    private String teamId;           // ref → Team

    private String competitionId;    // ref → Competition

    private Integer matchsJoues;

    private Integer victoires;

    private Integer defaites;

    private Integer nuls;

    private Integer butsMarques;

    private Integer butsEncaisses;
}