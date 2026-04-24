package com.example.coplaybackend.Entities.Competitions;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "journees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Journee {

    @Id
    private String id;

    private Integer numero;

    private LocalDate datePrevue;

    @DBRef
    private List<MatchCompetition> matchs;
}

