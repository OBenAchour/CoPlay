package com.example.coplaybackend.Entities.Messaging;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    private String messageId;

    private String senderId;         // ref → User

    private String conversationId;   // ref → Conversation

    private String content;

    private MessageStatus status;

    private LocalDateTime sentAt;

    private Boolean isDeleted = false;
}
