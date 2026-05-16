package com.example.coplaybackend.DTOs.Social;

import com.example.coplaybackend.Entities.Social.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePostRequest {

    @NotNull(message = "Post type is required")
    private PostType type;

    @NotBlank(message = "Content is required")
    private String content;

    private String photoUrl;

    private String eventRefId;
}
