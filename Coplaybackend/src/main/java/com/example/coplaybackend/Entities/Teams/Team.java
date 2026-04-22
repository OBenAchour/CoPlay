package com.example.coplaybackend.Entities.Teams;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {

    @Id
    private String teamId;

    private String name;

    private String sport;

    private String city;

    private String description;

    private Integer capacityMax;

    private TeamStatus status;

    private String creatorId; // ← AJOUTE ÇA
}
