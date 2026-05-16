package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.NegotiationRequest;
import com.example.coplaybackend.Entities.Marketplace.Negotiation;
import com.example.coplaybackend.Services.Marketplace.NegotiationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace/negotiations")
@RequiredArgsConstructor
public class NegotiationController {

    private final NegotiationService negotiationService;

    @PostMapping
    public ResponseEntity<Negotiation> startOrGet(@RequestBody NegotiationRequest req) {
        return ResponseEntity.ok(negotiationService.startOrGet(req));
    }

    @PostMapping("/{id}/propose")
    public ResponseEntity<Negotiation> propose(@PathVariable String id, @RequestBody Map<String, BigDecimal> body) {
        return ResponseEntity.ok(negotiationService.propose(id, body.get("price")));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Negotiation> accept(@PathVariable String id) {
        return ResponseEntity.ok(negotiationService.accept(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Negotiation> reject(@PathVariable String id) {
        return ResponseEntity.ok(negotiationService.reject(id));
    }

    @GetMapping("/buyer")
    public ResponseEntity<List<Negotiation>> asBuyer() {
        return ResponseEntity.ok(negotiationService.listMineAsBuyer());
    }

    @GetMapping("/seller")
    public ResponseEntity<List<Negotiation>> asSeller() {
        return ResponseEntity.ok(negotiationService.listMineAsSeller());
    }
}
