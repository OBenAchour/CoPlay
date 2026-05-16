package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.FraudReport;
import com.example.coplaybackend.Services.Marketplace.FraudService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/marketplace/fraud")
@RequiredArgsConstructor
public class FraudReportController {

    private final FraudService fraudService;

    @PostMapping
    public ResponseEntity<FraudReport> report(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                fraudService.report(body.get("targetId"), body.get("targetType"), body.get("reason")));
    }

    @GetMapping("/open")
    public ResponseEntity<Page<FraudReport>> listOpen(@RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(fraudService.listOpen(page, size));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<FraudReport> updateStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(fraudService.updateStatus(id, status));
    }
}
