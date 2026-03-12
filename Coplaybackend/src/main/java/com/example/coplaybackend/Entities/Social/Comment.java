package com.example.coplaybackend.Entities.Social;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    private String commentId;

    private String postId;           // ref → Post

    private String authorId;         // ref → User

    private String parentCommentId;  // ref → Comment (null si commentaire racine)

    private String content;

    private LocalDateTime createdAt;

    private Boolean isDeleted = false;
}
