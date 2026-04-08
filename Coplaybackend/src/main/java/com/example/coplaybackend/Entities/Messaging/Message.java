package com.example.coplaybackend.Entities.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
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

    @Indexed(unique = false)  // Override any unique index on sender.email
    private User sender;

    private Conversation conversation;

    private String content;

    private MessageStatus status;

    private LocalDateTime sentAt;

    private Boolean isDeleted = false;
}