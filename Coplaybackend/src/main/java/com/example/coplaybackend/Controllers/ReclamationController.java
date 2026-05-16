package com.example.coplaybackend.Controllers;

import com.example.coplaybackend.Entities.Reclamation;
import com.example.coplaybackend.Repositories.ReclamationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reclamations")
@CrossOrigin(origins = "http://localhost:4200")
public class ReclamationController {

    @Autowired
    private ReclamationRepository repository;

    @PostMapping
    public Reclamation creerReclamation(@RequestBody Reclamation rec) {
        rec.setDateCreation(LocalDateTime.now()); // Forcer la date côté serveur
        rec.setTraitee(false);
        return repository.save(rec);
    }

    @GetMapping
    public List<Reclamation> recupererToutes() {
        return repository.findAll();
    }

    @PatchMapping("/{id}/traiter")
    public ResponseEntity<Reclamation> marquerTraitee(@PathVariable String id) {
        return repository.findById(id).map(rec -> {
            rec.setTraitee(true);
            return ResponseEntity.ok(repository.save(rec));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable String id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}