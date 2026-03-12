package com.example.coplaybackend.Entities.Social;

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

    private String userId;           // ref → User

    private LikeTargetType targetType;

    private String targetId;         // ref → Post ou Comment selon targetType

    private LocalDateTime createdAt;
}
