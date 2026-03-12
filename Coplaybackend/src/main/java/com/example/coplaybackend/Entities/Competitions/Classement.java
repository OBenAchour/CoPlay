package com.example.coplaybackend.Entities.Competitions;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "classements")
@CompoundIndex(name = "unique_classement",
        def = "{'competitionId': 1, 'teamId': 1}",
        unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classement {

    @Id
    private String id;

    private String competitionId;    // ref → Competition

    private String teamId;           // ref → Team

    private Integer points;

    private Integer goalsFor;

    private Integer goalsAgainst;

    private Integer goalDifference;  // calculé : goalsFor - goalsAgainst

    private Integer rank;
}
