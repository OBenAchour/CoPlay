package com.example.coplaybackend.DTOs.Messaging;

import com.example.coplaybackend.Entities.Messaging.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddMediaRequest {

    @NotNull(message = "Media type is required")
    private MediaType mediaType;

    @NotBlank(message = "Media URL is required")
    @Pattern(regexp = "^https?://.*", message = "URL must start with http:// or https://")
    private String url;

    @NotBlank(message = "File name is required")
    @Size(max = 255, message = "File name cannot exceed 255 characters")
    private String fileName;

    @NotNull(message = "File size is required")
    @Positive(message = "File size must be positive")
    @Max(value = 104857600, message = "File size cannot exceed 100MB")
    private Long sizeBytes;
}
