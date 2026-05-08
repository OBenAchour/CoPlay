package com.example.coplaybackend.Entities.Competitions;

import com.example.coplaybackend.Entities.Teams.Team;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "statistiques_equipe")
@CompoundIndex(name = "unique_stat",
        def = "{\"teamId\": 1, \"competitionId\": 1}",
        unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatistiqueEquipe {

    @Id
    private String id;

    @DBRef
    private Team equipe;           // ref → Team

    @DBRef
    private Competition competition;    // ref → Competition

    private Integer matchsJoues;

    private Integer victoires;

    private Integer defaites;

    private Integer nuls;

    private Integer butsPour;

    private Integer butsContre;

    public Integer getPoints() {
        // Exemple de calcul des points : 3 points pour une victoire, 1 point pour un nul
        return (this.victoires != null ? this.victoires * 3 : 0) + (this.nuls != null ? this.nuls : 0);
    }

    public void setPoints(int points) {
        // Implémentation fictive, à adapter selon la logique métier
        // Par exemple, vous pouvez recalculer les victoires et nuls en fonction des points
        this.victoires = points / 3;
        this.nuls = points % 3;
    }
}