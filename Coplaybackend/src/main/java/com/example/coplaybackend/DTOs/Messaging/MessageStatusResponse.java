package com.example.coplaybackend.DTOs.Messaging;

import com.example.coplaybackend.Entities.Messaging.MessageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageStatusResponse {
    private String messageId;
    private MessageStatus status;
    private LocalDateTime updatedAt;
}