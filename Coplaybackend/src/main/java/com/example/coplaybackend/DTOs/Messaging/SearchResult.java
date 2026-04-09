package com.example.coplaybackend.DTOs.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResult {
    private String messageId;
    private String conversationId;
    private String conversationName;
    private User sender;
    private String content;
    private LocalDateTime sentAt;
    private String matchedText;
    private int matchPosition;
}