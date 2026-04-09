package com.example.coplaybackend.Services.Messaging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Component("s3StorageProvider")
@Slf4j
@ConditionalOnProperty(name = "aws.s3.enabled", havingValue = "true")
public class S3StorageProvider implements StorageProvider {

    @Value("${aws.s3.signed-url-expiration:3600}")
    private int signedUrlExpiration;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.endpoint}")
    private String baseUrl;

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    public S3StorageProvider(S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    @Override
    public String storeFile(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String uniqueFileName = "messages/" + UUID.randomUUID().toString() + "." + fileExtension;

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(uniqueFileName)
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );

            String fileUrl = baseUrl + "/" + uniqueFileName;
            log.info("File uploaded to S3: {} -> {}", originalFileName, fileUrl);
            return uniqueFileName;
        } catch (Exception e) {
            log.error("Error uploading file to S3: {}", originalFileName, e);
            throw new IOException("Failed to upload file to S3", e);
        }
    }

    public String generateSignedUrl(String fileReference) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileReference)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(signedUrlExpiration))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();
        } catch (Exception e) {
            log.error("Error generating signed URL for: {}", fileReference, e);
            throw new RuntimeException("Failed to generate signed URL", e);
        }
    }

    @Override
    public void deleteFile(String fileReference) {
        try {
            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(fileReference)
                            .build()
            );
            log.info("File deleted from S3: {}", fileReference);
        } catch (Exception e) {
            log.error("Error deleting file from S3: {}", fileReference, e);
        }
    }

    @Override
    public byte[] getFile(String fileReference) throws IOException {
        try {
            return s3Client.getObject(
                    GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(fileReference)
                            .build()
            ).readAllBytes();
        } catch (Exception e) {
            log.error("Error downloading file from S3: {}", fileReference, e);
            throw new IOException("Failed to download file from S3", e);
        }
    }

    @Override
    public String getOriginalFileName(String fileReference) {
        String[] parts = fileReference.split("/");
        return parts[parts.length - 1];
    }

    @Override
    public boolean fileExists(String fileReference) {
        try {
            s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucketName)
                            .key(fileReference)
                            .build()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return "bin";
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1).toLowerCase() : "bin";
    }
}