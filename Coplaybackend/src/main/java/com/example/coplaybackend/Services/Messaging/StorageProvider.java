// StorageProvider.java
package com.example.coplaybackend.Services.Messaging;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StorageProvider {
    /**
     * Store file and return the file path/URL
     */
    String storeFile(MultipartFile file) throws IOException;

    /**
     * Delete stored file
     */
    void deleteFile(String fileReference);

    /**
     * Get file by reference
     */
    byte[] getFile(String fileReference) throws IOException;

    /**
     * Get original file name
     */
    String getOriginalFileName(String fileReference);

    /**
     * Check if file exists
     */
    boolean fileExists(String fileReference);
}
