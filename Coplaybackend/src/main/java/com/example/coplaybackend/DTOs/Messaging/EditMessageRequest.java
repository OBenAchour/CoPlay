package com.example.coplaybackend.DTOs.Messaging;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EditMessageRequest {
    @NotBlank(message = "Content cannot be empty")
    private String content;
}