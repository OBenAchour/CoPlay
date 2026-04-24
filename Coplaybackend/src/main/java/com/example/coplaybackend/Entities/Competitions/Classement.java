package com.example.coplaybackend.Entities.Competitions;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "classements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classement {

    @Id
    private String id;

    @DBRef
    private Competition competition;    // ref → Competition

    @DBRef
    private List<StatistiqueEquipe> table; // table triée des statistiques par équipe
}
