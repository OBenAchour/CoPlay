package com.example.coplaybackend.DTOs.Messaging;

import com.example.coplaybackend.Entities.Messaging.MessageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private MessageStatus status;
}