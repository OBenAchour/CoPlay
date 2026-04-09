// FileStorageService.java
package com.example.coplaybackend.Services.Messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileStorageService {

    @Value("${storage.provider:local}")
    private String storageProvider;

    private final StorageProvider localStorageProvider;
    private final StorageProvider s3StorageProvider;

    // Allowed MIME types
    private static final String[] ALLOWED_MIME_TYPES = {
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "video/mp4", "video/quicktime", "video/x-msvideo",
            "audio/mpeg", "audio/wav", "audio/ogg",
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    @Value("${file.max-size:10485760}")
    private long maxFileSize;

    /**
     * Store file using configured provider
     */
    public String storeFile(MultipartFile file) throws IOException {
        validateFile(file);

        StorageProvider provider = getStorageProvider();
        return provider.storeFile(file);
    }

    /**
     * Delete file using configured provider
     */
    public void deleteFile(String fileReference) {
        StorageProvider provider = getStorageProvider();
        provider.deleteFile(fileReference);
    }

    /**
     * Get file using configured provider
     */
    public byte[] getFile(String fileReference) throws IOException {
        StorageProvider provider = getStorageProvider();
        return provider.getFile(fileReference);
    }

    /**
     * Get original filename
     */
    public String getOriginalFileName(String fileReference) {
        StorageProvider provider = getStorageProvider();
        return provider.getOriginalFileName(fileReference);
    }

    /**
     * Check if file exists
     */
    public boolean fileExists(String fileReference) {
        StorageProvider provider = getStorageProvider();
        return provider.fileExists(fileReference);
    }

    /**
     * Get the active storage provider
     */
    private StorageProvider getStorageProvider() {
        if ("s3".equalsIgnoreCase(storageProvider)) {
            log.debug("Using S3 storage provider");
            return s3StorageProvider;
        } else {
            log.debug("Using local storage provider");
            return localStorageProvider;
        }
    }

    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds maximum limit of " + (maxFileSize / 1024 / 1024) + "MB");
        }

        String mimeType = file.getContentType();
        if (mimeType == null || !isAllowedMimeType(mimeType)) {
            throw new RuntimeException("File type not allowed. Allowed types: images, videos, audio, PDF, Word documents");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.contains("..")) {
            throw new RuntimeException("Invalid filename");
        }
    }

    /**
     * Check if MIME type is allowed
     */
    private boolean isAllowedMimeType(String mimeType) {
        for (String allowed : ALLOWED_MIME_TYPES) {
            if (mimeType.equalsIgnoreCase(allowed)) {
                return true;
            }
        }
        return false;
    }
    public String generateSignedUrl(String fileReference) {
        StorageProvider provider = getStorageProvider();
        if (provider instanceof S3StorageProvider) {
            return ((S3StorageProvider) provider).generateSignedUrl(fileReference);
        }
        // Pour local storage, retourner chemin direct
        return "/api/files/download/" + fileReference;
    }
}
