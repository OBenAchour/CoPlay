package com.example.coplaybackend.DTOs.Messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendMessageRequest {

    @NotBlank(message = "Conversation ID is required")
    private String conversationId;

    @NotBlank(message = "Message content cannot be empty")
    @Size(min = 1, max = 5000, message = "Message must be between 1 and 5000 characters")
    private String content;
}
