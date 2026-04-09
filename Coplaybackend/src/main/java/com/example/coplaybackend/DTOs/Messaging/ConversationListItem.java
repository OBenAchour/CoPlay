package com.example.coplaybackend.DTOs.Messaging;
import com.example.coplaybackend.Entities.Messaging.ConversationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConversationListItem {
    private String conversationId;
    private ConversationType type;
    private String name;  // For GROUP/TEAM, or other user's name for DIRECT
    private String otherUserId;  // Only for DIRECT
    private String otherUserAvatar;  // First letter of name
    private String lastMessageContent;
    private LocalDateTime lastMessageTime;
    private long unreadCount;
}