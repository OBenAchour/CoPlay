package com.example.coplaybackend.Entities.Auth;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    @Indexed
    private String email;

    private String passwordHash;

    private Role role;

    private Boolean isEmailVerified = false;

    private Boolean isActive = true;

    // L'AGRÉGATION (EMBEDDING) SE FAIT ICI
    private UserProfile profile;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;

    // ← AJOUTER CE CHAMP SI MANQUANT (pour AwardService)
    @Builder.Default
    private Integer stars = 0;  // Nombre d'étoiles du joueur (récompenses)
    // AJOUTER CE GETTER
    /**
     * Getter de compatibilité - MongoDB utilise @Id private String id
     */
    public String getUserId() {
        return this.id;
    }


}