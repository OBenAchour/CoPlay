// FileUploadResponse.java
package com.example.coplaybackend.DTOs.Messaging;

import com.example.coplaybackend.Entities.Messaging.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadResponse {
    private String mediaId;
    private String fileName;
    private String fileUrl;
    private MediaType mediaType;
    private Long fileSizeBytes;
    private LocalDateTime uploadedAt;
}
