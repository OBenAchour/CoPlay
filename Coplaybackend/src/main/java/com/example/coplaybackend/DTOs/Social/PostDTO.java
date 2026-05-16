package com.example.coplaybackend.DTOs.Social;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Events.Event;
import com.example.coplaybackend.Entities.Social.PostType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDTO {

    private String postId;
    private User author;
    private PostType type;
    private String content;
    private String photoUrl;
    private Event eventRef;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long likeCount;
    private long commentCount;
}
