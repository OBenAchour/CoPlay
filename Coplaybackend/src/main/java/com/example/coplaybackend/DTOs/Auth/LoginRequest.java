package com.example.coplaybackend.DTOs.Auth;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
