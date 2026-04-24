package com.example.coplaybackend.Entities.Auth;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "refresh_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    @Id
    private String tokenId;

    // On stocke l'objet User (ou juste une version simplifiée)
    private User user;

    private String tokenHash;
    private LocalDateTime expiresAt;
    private Boolean isRevoked = false;
    private LocalDateTime createdAt;
}