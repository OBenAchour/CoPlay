package com.example.coplaybackend.Entities.Auth;

import lombok.*;

import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    // Plus d'ID ici, c'est l'ID du User qui compte


    @Getter
    @Setter
    private String id;

    private String displayName;

    private String profilePicture;

    private String bio;

    private SportLevel level;

    private String city;

    private String phone;

    private LocalDateTime updatedAt;
}