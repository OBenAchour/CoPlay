package com.example.coplaybackend.Controllers.Auth;



import com.example.coplaybackend.DTOs.Auth.AuthResponse;
import com.example.coplaybackend.DTOs.Auth.LoginRequest;
import com.example.coplaybackend.DTOs.Auth.RegisterRequest;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Services.Auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200") // Autorise Angular
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Gestion de l'inscription et de la connexion")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Inscription d'un nouvel utilisateur (PLAYER)")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        // On retourne l'utilisateur créé pour confirmer que l'agrégation fonctionne
        return ResponseEntity.ok(authService.register(request));
    }
    @PostMapping("/login")
    @Operation(summary = "Connexion d'un utilisateur")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}