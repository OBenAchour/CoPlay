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
import java.util.Random;


@Service
@RequiredArgsConstructor
public class AuthService {


    private final EmailService emailService;

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé !");
        }


        // Création de l'objet User avec son Profile agrégé

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.PLAYER)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .profile(UserProfile.builder()

                        .displayName(request.getDisplayName())
                        .city(request.getCity())
                        .level(request.getLevel())
                        .updatedAt(LocalDateTime.now())
                        .build())
                .build();

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new RuntimeException("Votre compte est bloqué. Veuillez contacter l'administrateur.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Email ou mot de passe incorrect.");
        }

        String token = jwtUtils.generateToken(user);


        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .displayName(user.getProfile().getDisplayName())
                .build();
    }


    public List<User> searchUsers(String query) {
        return userRepository
                .findByProfileDisplayNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    public String resetUserPassword(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String tempPassword = generateRandomPassword(8);
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        return tempPassword;
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("L'email n'existe pas."));

        String tempPass = generateRandomPassword(8);
        user.setPasswordHash(passwordEncoder.encode(tempPass));
        userRepository.save(user);

        emailService.sendTempPassword(user.getEmail(), tempPass);
    }

    public void updateOwnPassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("L'ancien mot de passe est incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User getUserById(String id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    public void incrementStars(String userId, int stars) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        // Ajoutez ici la logique pour incrémenter les étoiles de l'utilisateur
        userRepository.save(user);
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();

        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }

        return sb.toString();
    }
}

