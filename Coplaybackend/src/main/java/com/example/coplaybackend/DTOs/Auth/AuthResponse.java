package com.example.coplaybackend.DTOs.Auth;

import com.example.coplaybackend.Entities.Auth.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String userId;      // ← AJOUTE CET CHAMP
    private String email;
    private Role role;
    private String displayName;
}