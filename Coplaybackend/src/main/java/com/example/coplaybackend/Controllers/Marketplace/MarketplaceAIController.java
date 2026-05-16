package com.example.coplaybackend.Controllers.Marketplace;

import com.example.coplaybackend.DTOs.Marketplace.AIChatRequest;
import com.example.coplaybackend.Entities.Marketplace.Equipment;
import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import com.example.coplaybackend.Services.AI.MarketplaceAIService;
import com.example.coplaybackend.Services.Marketplace.EquipmentService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace/ai")
@RequiredArgsConstructor
public class MarketplaceAIController {

    private final MarketplaceAIService aiService;
    private final EquipmentService equipmentService;

    @GetMapping("/recommendations")
    public ResponseEntity<List<Equipment>> recommendations(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(aiService.recommendEquipments(SecurityUtils.getCurrentUserId(), limit));
    }

    @PostMapping("/estimate-price/{equipmentId}")
    public ResponseEntity<Map<String, Object>> estimatePrice(@PathVariable String equipmentId) {
        Equipment e = equipmentService.getById(equipmentId);
        BigDecimal est = aiService.estimatePrice(e);
        return ResponseEntity.ok(Map.of("estimatedPrice", est, "currency", "EUR"));
    }

    @GetMapping("/match-providers")
    public ResponseEntity<List<MarketplaceService>> matchProviders(@RequestParam String sport,
                                                                   @RequestParam(defaultValue = "") String need,
                                                                   @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(aiService.matchProvidersForTeam(sport, need, limit));
    }

    @PostMapping("/detect-fraud/{equipmentId}")
    public ResponseEntity<Map<String, Object>> detectFraud(@PathVariable String equipmentId) {
        Equipment e = equipmentService.getById(equipmentId);
        return ResponseEntity.ok(aiService.detectFraud(e));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody AIChatRequest req) {
        String reply = aiService.chatbot(SecurityUtils.getCurrentUserId(), req.getMessage());
        return ResponseEntity.ok(Map.of("reply", reply == null ? "" : reply));
    }
}
