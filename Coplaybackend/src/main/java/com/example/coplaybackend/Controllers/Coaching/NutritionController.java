package com.example.coplaybackend.Controllers.Coaching;

import com.example.coplaybackend.Entities.Coaching.NutritionPlan;
import com.example.coplaybackend.Services.Coaching.NutritionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coaching/nutrition")
@RequiredArgsConstructor
public class NutritionController {

    private final NutritionService service;

    @PostMapping
    public ResponseEntity<NutritionPlan> create(@RequestBody NutritionPlan p) { return ResponseEntity.ok(service.create(p)); }

    @PutMapping("/{id}")
    public ResponseEntity<NutritionPlan> update(@PathVariable String id, @RequestBody NutritionPlan p) {
        return ResponseEntity.ok(service.update(id, p));
    }

    @GetMapping("/me")
    public ResponseEntity<List<NutritionPlan>> mine() { return ResponseEntity.ok(service.listMine()); }

    @GetMapping("/{id}")
    public ResponseEntity<NutritionPlan> get(@PathVariable String id) { return ResponseEntity.ok(service.getById(id)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
