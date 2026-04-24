package com.example.coplaybackend.DTOs.Auth;

import com.example.coplaybackend.Entities.Auth.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String email;
    private Role role;

    private String displayName;
}
