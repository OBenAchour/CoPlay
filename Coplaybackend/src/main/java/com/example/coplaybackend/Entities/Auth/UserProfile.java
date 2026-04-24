package com.example.coplaybackend.Entities.Auth;

import lombok.*;
import org.springframework.data.annotation.Id; // Ajouté pour la cohérence MongoDB
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    private String id; // L'ID du User qui sert de clé primaire ici

    private String displayName;

    private String profilePicture;

    private String bio;

    private SportLevel level;

    private String city;

    private String phone;

    private LocalDateTime updatedAt;
}