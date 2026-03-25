package com.example.coplaybackend.Entities.Social;
import com.example.coplaybackend.Entities.Auth.User;
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

    private Post post;           // ref → Post

    private User author;         // ref → User

    private Comment parentComment;  // ref → Comment (null si commentaire racine)

    private String content;

    private LocalDateTime createdAt;

    private Boolean isDeleted = false;
}
