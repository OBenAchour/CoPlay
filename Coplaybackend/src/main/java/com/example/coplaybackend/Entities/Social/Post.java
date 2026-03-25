package com.example.coplaybackend.Entities.Social;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Events.Event;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    private String postId;

    private User author;         // ref → User

    private PostType type;

    private String content;

    private String photoUrl;

    private Event eventRef;         // ref → Event (optionnel)

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean isDeleted = false;
}
