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

    @Builder.Default
    private Integer pointsPerWin = 3;

    @Builder.Default
    private Integer pointsPerDraw = 1;

    @Builder.Default
    private Integer pointsPerLoss = 0;

    private Integer nbJournees;
}
