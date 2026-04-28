package com.example.coplaybackend.Entities.Teams;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "demandes_adhesion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeAdhesion {

    @Id
    private String demandeId;

    private String teamId;           // ref → Team

    private String userId;           // ref → User

    private RoleEquipe proposedRole;

    private StatutDemande statut;

    private LocalDateTime createdAt;
}
