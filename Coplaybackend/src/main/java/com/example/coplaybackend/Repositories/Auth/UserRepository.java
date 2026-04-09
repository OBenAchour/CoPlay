package com.example.coplaybackend.Repositories.Auth;

import com.example.coplaybackend.Entities.Auth.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

import java.util.Optional;

// UserRepository.java
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    List<User> findByProfileDisplayNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

}