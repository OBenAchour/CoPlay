package com.example.coplaybackend.Controllers.AI;

import com.example.coplaybackend.Services.AI.AutoCompleteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AutoCompleteController {

    private final AutoCompleteService autoCompleteService;

    @PostMapping("/complete")
    public ResponseEntity<Map<String, String>> complete(
            @RequestBody CompletionRequest request) {

        log.info("AI completion request: {}", request.getPrefix());

        String suggestion = autoCompleteService.suggestCompletion(
                request.getPrefix(),
                request.getContext()
        );

        if (suggestion == null) {
            return ResponseEntity.ok(Map.of("suggestion", ""));
        }

        return ResponseEntity.ok(Map.of("suggestion", suggestion));
    }

    @PostMapping("/complete/multiple")
    public ResponseEntity<Map<String, Object>> completeMultiple(
            @RequestBody CompletionRequest request) {

        log.info("AI multiple completion request: {}", request.getPrefix());

        int count = request.getCount() != null ? request.getCount() : 3;
        List<String> suggestions = autoCompleteService.suggestMultiple(
                request.getPrefix(),
                request.getContext(),
                count
        );

        return ResponseEntity.ok(Map.of("suggestions", suggestions));
    }

    @lombok.Data
    public static class CompletionRequest {
        private String prefix;
        private String context;
        private Integer count;
    }
}