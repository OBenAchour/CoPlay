package com.example.coplaybackend.DTOs.Auth;


import com.example.coplaybackend.Entities.Auth.SportLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String displayName;
    private String city;
    private SportLevel level; // Ton Enum
}
