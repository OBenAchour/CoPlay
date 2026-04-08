package com.example.coplaybackend.Services.Auth;

import com.example.coplaybackend.Config.JwtUtils;
import com.example.coplaybackend.DTOs.Auth.AuthResponse;
import com.example.coplaybackend.DTOs.Auth.LoginRequest;
import com.example.coplaybackend.DTOs.Auth.RegisterRequest;
import com.example.coplaybackend.Entities.Auth.Role;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Auth.UserProfile;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé !");
        }

        // Création de l'objet User avec son Profile agrégé
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.PLAYER) // Par défaut, on attribue le rôle de PLAYER
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .profile(UserProfile.builder() // Agrégation ici
                        .displayName(request.getDisplayName())
                        .city(request.getCity())
                        .level(request.getLevel())
                        .updatedAt(LocalDateTime.now())
                        .build())
                .build();

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mot de passe incorrect");
        }


        // Dans AuthService.java, méthode login :
        String token = jwtUtils.generateToken(user); // On passe l'objet user complet

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .displayName(user.getProfile().getDisplayName())
                .build();
    }
    public List<User> searchUsers(String query) {
        return userRepository.findByProfileDisplayNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }
}
