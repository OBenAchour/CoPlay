package com.example.coplaybackend.Entities.Teams;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "equipe_sponsors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipeSponsor {

    @Id
    private String id;

    private String teamId;           // ref → Team

    private String sponsorName;

    private String logoUrl;
}
