package com.example.coplaybackend.Entities.Messaging;
import com.example.coplaybackend.Entities.Auth.User;
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

    private User sender;

    private Conversation conversation;   // ref → Conversation

    private String content;

    private MessageStatus status;

    private LocalDateTime sentAt;

    private Boolean isDeleted = false;
}
