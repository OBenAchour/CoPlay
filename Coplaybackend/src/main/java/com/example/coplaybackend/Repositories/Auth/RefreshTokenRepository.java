package com.example.coplaybackend.Repositories.Auth;

import com.example.coplaybackend.Entities.Auth.RefreshToken;
import com.example.coplaybackend.Entities.Auth.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

// RefreshTokenRepository.java
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    void deleteByUser(User user);
}