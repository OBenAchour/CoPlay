package com.example.coplaybackend.Entities.Teams;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "historique_actions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueAction {

    @Id
    private String id;

    private String teamId;           // ref → Team

    private String actorId;          // ref → User

    private String action;

    private LocalDateTime performedAt;
}
