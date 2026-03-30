package com.example.coplaybackend.Controllers.User;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Services.Auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    private final AuthService authService; // Utilisation de AuthService au lieu de AdminService
    private final UserRepository userRepository;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setRole(userDetails.getRole());
                    user.setIsActive(userDetails.getIsActive());
                    if (userDetails.getProfile() != null && user.getProfile() != null) {
                        user.getProfile().setDisplayName(userDetails.getProfile().getDisplayName());
                    }
                    userRepository.save(user);
                    return ResponseEntity.ok().body("{\"message\": \"Utilisateur mis à jour avec succès\"}");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok().body("{\"message\": \"Utilisateur supprimé\"}");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // CORRECTION : Changement de Long à String pour l'ID
    @PutMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable String id) {
        try {
            String newTempPassword = authService.resetUserPassword(id);
            // On renvoie un JSON propre
            return ResponseEntity.ok(Map.of("temporaryPassword", newTempPassword));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}