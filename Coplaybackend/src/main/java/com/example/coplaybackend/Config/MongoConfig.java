package com.example.coplaybackend.Config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.example.coplaybackend")
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${app.mongodb.uri}")
    private String mongoUri;

    @Value("${app.mongodb.database}")
    private String databaseName;

    @Override
    protected String getDatabaseName() {
        return databaseName;
    }

    @Override
    public MongoClient mongoClient() {
        ConnectionString connectionString = new ConnectionString(mongoUri);
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .build();
        return MongoClients.create(settings);
    }

    /**
     * Désactivation de la création automatique d'index.
     * Cela règle l'erreur "Index already defined" qui empêche le démarrage.
     */
    @Override

    protected boolean autoIndexCreation() {
        return false;
    }

    @Override
    public org.springframework.data.mongodb.core.convert.MongoCustomConversions customConversions() {
        java.util.List<org.springframework.core.convert.converter.Converter<?, ?>> converters = new java.util.ArrayList<>();
        converters.add(new StringToLocalDateConverter());
        return new org.springframework.data.mongodb.core.convert.MongoCustomConversions(converters);
    }

    private static class StringToLocalDateConverter implements org.springframework.core.convert.converter.Converter<String, java.time.LocalDate> {
        @Override
        public java.time.LocalDate convert(String source) {
            if (source == null || source.isEmpty()) return null;
            try {
                // Tente de parser le format ISO complet (ex: 2026-04-01T23:00:00.000+00:00)
                if (source.contains("T")) {
                    return java.time.OffsetDateTime.parse(source).toLocalDate();
                }
                return java.time.LocalDate.parse(source);
            } catch (Exception e) {
                return null;
            }
        }
    }
}