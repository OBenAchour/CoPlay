package com.example.coplaybackend.Entities.Messaging;

import com.example.coplaybackend.Entities.Auth.User;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    private String messageId;

    @Indexed(unique = false)
    private User sender;

    private Conversation conversation;

    private String content;

    private MessageStatus status;

    private LocalDateTime sentAt;

    private Boolean isDeleted = false;

    @Builder.Default
    private List<MessageReaction> reactions = new ArrayList<>();

    private Boolean isEdited = false;

    private LocalDateTime editedAt;
}