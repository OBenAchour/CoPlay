package com.example.coplaybackend.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Configuration du WebClient.
 * Nécessaire pour que Spring puisse injecter WebClient.Builder
 * dans LocationService (appels API Google Maps Geocoding).
 */
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}