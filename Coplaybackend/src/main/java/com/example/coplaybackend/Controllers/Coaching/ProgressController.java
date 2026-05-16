package com.example.coplaybackend.Controllers.Coaching;

import com.example.coplaybackend.Entities.Coaching.ProgressEntry;
import com.example.coplaybackend.Services.Coaching.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coaching/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService service;

    @PostMapping
    public ResponseEntity<ProgressEntry> create(@RequestBody ProgressEntry e) { return ResponseEntity.ok(service.record(e)); }

    @GetMapping("/me")
    public ResponseEntity<List<ProgressEntry>> mine() { return ResponseEntity.ok(service.listMine()); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
