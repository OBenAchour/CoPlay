package com.example.coplaybackend.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration pour servir les fichiers statiques (images uploadées)
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${image.upload.directory:./uploads/images}")
    private String uploadDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir les images depuis le répertoire d'upload
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations("file:" + uploadDirectory + "/");
    }
}
