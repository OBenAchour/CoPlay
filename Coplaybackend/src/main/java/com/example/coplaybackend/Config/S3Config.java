package com.example.coplaybackend.Config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
@Slf4j
@ConditionalOnProperty(
        name = "aws.s3.enabled",
        havingValue = "true"
)
public class S3Config {

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.endpoint}")
    private String endpoint;

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .region(Region.of(region))
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public S3Client s3Client() {
        log.info("Initializing S3 Client with endpoint: {}", endpoint);
        return S3Client.builder()
                .region(Region.of(region))
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}