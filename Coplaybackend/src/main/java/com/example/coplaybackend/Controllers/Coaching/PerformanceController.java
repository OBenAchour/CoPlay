package com.example.coplaybackend.Controllers.Coaching;

import com.example.coplaybackend.Entities.Coaching.PerformanceMetric;
import com.example.coplaybackend.Services.Coaching.PerformanceAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coaching/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceAnalysisService service;

    @PostMapping
    public ResponseEntity<PerformanceMetric> record(@RequestBody PerformanceMetric m) {
        return ResponseEntity.ok(service.record(m));
    }

    @GetMapping("/me")
    public ResponseEntity<List<PerformanceMetric>> mine() { return ResponseEntity.ok(service.listMine()); }

    @GetMapping("/risk/{userId}")
    public ResponseEntity<Map<String, Object>> risk(@PathVariable String userId) {
        return ResponseEntity.ok(service.computeAcwr(userId));
    }
}
