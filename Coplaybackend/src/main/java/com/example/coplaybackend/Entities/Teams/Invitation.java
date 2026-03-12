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

    private String teamId;           // ref → Team

    private String invitedUserId;    // ref → User (invité)

    private String invitedByUserId;  // ref → User (qui invite)

    private StatutDemande statut;

    private LocalDateTime createdAt;
}
