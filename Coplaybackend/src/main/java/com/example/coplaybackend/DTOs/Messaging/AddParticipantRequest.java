package com.example.coplaybackend.DTOs.Messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddParticipantRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(ADMIN|MEMBER)$", message = "Role must be either ADMIN or MEMBER")
    private String role;
}
