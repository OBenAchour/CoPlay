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
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    /**
     * Enregistrer un nouvel utilisateur
     */
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé !");
        }

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

    /**
     * Connecter un utilisateur
     */
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
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .displayName(user.getProfile().getDisplayName())
                .build();
    }

    /**
     * Rechercher des utilisateurs
     */
    public List<User> searchUsers(String query) {
        return userRepository
                .findByProfileDisplayNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    /**
     * Récupérer un utilisateur par ID
     */
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    /**
     * Réinitialiser le mot de passe d'un utilisateur (admin)
     */
    public String resetUserPassword(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String tempPassword = generateRandomPassword(8);
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        return tempPassword;
    }

    /**
     * Mot de passe oublié
     */
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("L'email n'existe pas."));

        String tempPass = generateRandomPassword(8);
        user.setPasswordHash(passwordEncoder.encode(tempPass));
        userRepository.save(user);

        emailService.sendTempPassword(user.getEmail(), tempPass);
    }

    /**
     * Changer son mot de passe
     */
    public void updateOwnPassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("L'ancien mot de passe est incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Incrémenter les étoiles d'un utilisateur (récompenses)
     */
    public void incrementStars(String userId, int count) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Integer currentStars = user.getStars() != null ? user.getStars() : 0;
        user.setStars(currentStars + count);
        userRepository.save(user);

        log.info("✨ Utilisateur {} a reçu {} étoile(s). Total: {}",
                userId, count, user.getStars());
    }

    /**
     * Générer un mot de passe aléatoire
     */
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