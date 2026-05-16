// LocalStorageProvider.java
package com.example.coplaybackend.Services.Messaging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component("localStorageProvider")
@Slf4j
public class LocalStorageProvider implements StorageProvider {

    @Value("${file.upload-dir:uploads/messages}")
    private String uploadDir;

    private static final String METADATA_SEPARATOR = "|";

    @Override
    public String storeFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Created upload directory: {}", uploadDir);
        }

        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String uniqueFileName = UUID.randomUUID().toString() + "." + fileExtension;

        Path filePath = uploadPath.resolve(uniqueFileName);
        try (java.io.InputStream is = file.getInputStream()) {
            java.nio.file.Files.copy(is, filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }

        String reference = uniqueFileName + METADATA_SEPARATOR + originalFileName;
        log.info("File stored locally: {} -> {} ({} bytes)", originalFileName, uniqueFileName, file.getSize());
        return reference;
    }

    @Override
    public void deleteFile(String fileReference) {
        try {
            String uniqueFileName = fileReference.split("\\" + METADATA_SEPARATOR)[0];
            Path filePath = Paths.get(uploadDir, uniqueFileName);
            Files.deleteIfExists(filePath);
            log.info("File deleted: {}", uniqueFileName);
        } catch (IOException e) {
            log.error("Error deleting file: {}", fileReference, e);
        }
    }

    @Override
    public byte[] getFile(String fileReference) throws IOException {
        String uniqueFileName = fileReference.split("\\" + METADATA_SEPARATOR)[0];
        Path filePath = Paths.get(uploadDir, uniqueFileName);

        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + uniqueFileName);
        }

        return Files.readAllBytes(filePath);
    }

    @Override
    public String getOriginalFileName(String fileReference) {
        String[] parts = fileReference.split("\\" + METADATA_SEPARATOR);
        return parts.length > 1 ? parts[1] : parts[0];
    }

    @Override
    public boolean fileExists(String fileReference) {
        try {
            String uniqueFileName = fileReference.split("\\" + METADATA_SEPARATOR)[0];
            Path filePath = Paths.get(uploadDir, uniqueFileName);
            return Files.exists(filePath);
        } catch (Exception e) {
            return false;
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) {
            return "bin";
        }
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1).toLowerCase() : "bin";
    }
}
