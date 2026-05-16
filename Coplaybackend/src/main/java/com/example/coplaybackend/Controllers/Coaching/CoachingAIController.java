package com.example.coplaybackend.Controllers.Coaching;

import com.example.coplaybackend.DTOs.Coaching.AIChatRequest;
import com.example.coplaybackend.DTOs.Coaching.AIProgramRequest;
import com.example.coplaybackend.DTOs.Coaching.NutritionAIRequest;
import com.example.coplaybackend.Entities.Coaching.CoachingProgram;
import com.example.coplaybackend.Entities.Coaching.NutritionPlan;
import com.example.coplaybackend.Services.AI.CoachingAIService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/coaching/ai")
@RequiredArgsConstructor
public class CoachingAIController {

    private final CoachingAIService aiService;

    @PostMapping("/programs/generate")
    public ResponseEntity<CoachingProgram> generateProgram(@RequestBody AIProgramRequest req) {
        return ResponseEntity.ok(aiService.generateProgram(req));
    }

    @PostMapping("/nutrition/generate")
    public ResponseEntity<NutritionPlan> generateNutrition(@RequestBody NutritionAIRequest req) {
        return ResponseEntity.ok(aiService.generateNutrition(req));
    }

    @GetMapping("/injury-risk")
    public ResponseEntity<Map<String, Object>> injuryRisk(@RequestParam(required = false) String userId) {
        return ResponseEntity.ok(aiService.predictInjuryRisk(userId != null ? userId : SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/recovery")
    public ResponseEntity<Map<String, Object>> recovery() {
        return ResponseEntity.ok(aiService.recoveryAnalysis(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody AIChatRequest req) {
        String reply = aiService.chatbot(SecurityUtils.getCurrentUserId(), req.getMessage());
        return ResponseEntity.ok(Map.of("reply", reply == null ? "" : reply));
    }
}
