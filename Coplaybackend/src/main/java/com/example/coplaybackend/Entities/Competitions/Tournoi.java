package com.example.coplaybackend.Entities.Competitions;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "competitions")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Tournoi extends Competition {

    private String format;           // ex: "SINGLE_ELIMINATION", "DOUBLE_ELIMINATION"

    private Integer currentRound;

    private Integer totalRounds;
}