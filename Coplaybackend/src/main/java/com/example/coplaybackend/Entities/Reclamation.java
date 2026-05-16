package com.example.coplaybackend.Entities;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data  // Génère automatiquement tous les getters, setters, toString, equals
@Document(collection = "reclamations")
public class Reclamation {
    @Id
    private String id;
    private String nomComplet;
    private String email;
    private String objet;
    private String message;
    private LocalDateTime dateCreation = LocalDateTime.now();
    private boolean traitee = false;
}