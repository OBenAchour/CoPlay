package com.example.coplaybackend.DTOs.Messaging;

import com.example.coplaybackend.Entities.Messaging.ConversationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateConversationRequest {

    @NotNull(message = "Conversation type is required")
    private ConversationType type;

    @NotBlank(message = "Conversation name is required for GROUP and TEAM types")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @NotEmpty(message = "At least one participant is required")
    @Size(min = 1, max = 500, message = "Conversation cannot exceed 500 participants")
    private List<String> participantIds;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
}
