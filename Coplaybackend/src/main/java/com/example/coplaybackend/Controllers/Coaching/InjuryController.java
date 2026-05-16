package com.example.coplaybackend.Controllers.Coaching;

import com.example.coplaybackend.DTOs.Coaching.InjuryRequest;
import com.example.coplaybackend.Entities.Coaching.Injury;
import com.example.coplaybackend.Services.Coaching.InjuryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coaching/injuries")
@RequiredArgsConstructor
public class InjuryController {

    private final InjuryService service;

    @PostMapping
    public ResponseEntity<Injury> create(@RequestBody InjuryRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Injury> update(@PathVariable String id, @RequestBody InjuryRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Injury> get(@PathVariable String id) { return ResponseEntity.ok(service.getById(id)); }

    @GetMapping("/me")
    public ResponseEntity<List<Injury>> mine() { return ResponseEntity.ok(service.listMine()); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
