package com.example.coplaybackend.Entities.Competitions;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "inscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inscription {
    @Id
    private String id;

    private String competitionId;

    private String teamId;

    // 1. AJOUT DU CHAMP USERID (Obligatoire pour ton JSON Insomnia)
    private String userId;

    // 2. INITIALISATION PAR DÉFAUT DU STATUT
    @Builder.Default
    private String status = "PENDING";

    // 3. INITIALISATION DE LA DATE (Évite les erreurs de valeur nulle)
    @Builder.Default
    private LocalDateTime registrationDate = LocalDateTime.now();
}