package com.example.coplaybackend.Entities.Teams;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation {

    @Id
    private String invitationId;

    private String teamId;

    private String teamName;            // ← AJOUTER CE CHAMP

    private String invitedUserId;

    private String invitedByUserId;

    private RoleEquipe proposedRole;    // ← AJOUTER CE CHAMP

    private StatutDemande statut;

    private LocalDateTime createdAt;
}