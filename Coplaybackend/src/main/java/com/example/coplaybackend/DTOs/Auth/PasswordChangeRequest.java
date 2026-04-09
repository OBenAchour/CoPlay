package com.example.coplaybackend.DTOs.Auth;

import lombok.Data;

@Data
// PasswordChangeRequest.java
public class PasswordChangeRequest {
    private String oldPassword; // Doit correspondre à la clé envoyée par Angular
    private String newPassword;
}