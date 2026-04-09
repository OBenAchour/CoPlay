package com.example.coplaybackend.Controllers.User;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    private final UserRepository userRepository;

    // Récupérer tous les utilisateurs
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // MODIFIER un utilisateur (Rôle, Statut, Nom)
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setRole(userDetails.getRole());
                    user.setIsActive(userDetails.getIsActive()); // On utilise getIsActive() pour le type Boolean
                    if (userDetails.getProfile() != null) {
                        user.getProfile().setDisplayName(userDetails.getProfile().getDisplayName());
                    }
                    userRepository.save(user);
                    return ResponseEntity.ok().body("{\"message\": \"Utilisateur mis à jour avec succès\"}");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // SUPPRIMER un utilisateur
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok().body("{\"message\": \"Utilisateur supprimé\"}");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}