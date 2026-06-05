package com.example.coplaybackend.DTOs.Teams;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDTO {
    private String memberId;           // ID du membre (TeamMember._id)
    private String userId;             // ID de l'utilisateur
    private String displayName;        // Nom d'affichage (User.profile.displayName)
    private String email;              // Email de l'utilisateur
    private String roleEquipe;         // Rôle (CAPTAIN, PLAYER, COACH, STAFF)
    private String avatarUrl;          // URL de l'avatar (si existe)
    private Boolean active;            // Actif oui/non
}