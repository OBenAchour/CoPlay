package com.example.coplaybackend.Controllers.User;
import com.example.coplaybackend.Services.Auth.AuthService;

import com.example.coplaybackend.DTOs.Auth.PasswordChangeRequest;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Auth.UserProfile;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Services.Auth.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {
    private final UserRepository userRepository;
    private final AuthService authService; // ✅ Ajout

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody UserProfile profile) {
        return userRepository.findByEmail(authentication.getName())
                .map(user -> {
                    user.setProfile(profile);
                    userRepository.save(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    /**
     * GET /api/users/search?q=nom - Rechercher des utilisateurs par nom ou email
     */
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String q) {
        log.info("User search request with query: {}", q);
        return ResponseEntity.ok(authService.searchUsers(q));
    }



    // ✅ Nouvel endpoint change-password (déplacé depuis AuthController)
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @RequestBody PasswordChangeRequest request) {
        try {
            authService.updateOwnPassword(
                    authentication.getName(),
                    request.getOldPassword(),
                    request.getNewPassword()
            );
            return ResponseEntity.ok().body(Map.of("message", "Mot de passe mis à jour"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

}