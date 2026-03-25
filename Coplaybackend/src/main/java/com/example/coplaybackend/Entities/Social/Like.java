package com.example.coplaybackend.Entities.Social;

import com.example.coplaybackend.Entities.Auth.User;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "likes")
@CompoundIndex(name = "unique_like",
        def = "{'userId': 1, 'targetType': 1, 'targetId': 1}",
        unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Like {

    @Id
    private String likeId;

    private User userId;           // ref → User

    private LikeTargetType targetType;

    private Post post ;         // ref → Post

    private Comment comment ;         // ref → Comment

    private LocalDateTime createdAt;
}
