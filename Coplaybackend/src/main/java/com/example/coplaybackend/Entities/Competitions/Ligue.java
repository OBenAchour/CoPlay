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
public class Ligue extends Competition {

    private Integer pointsVictoire;

    private Integer pointsNul;

    private Integer pointsDefaite;

    private Integer nbJournees;
}
