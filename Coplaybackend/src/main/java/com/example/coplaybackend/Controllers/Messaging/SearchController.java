package com.example.coplaybackend.Controllers.Messaging;

import com.example.coplaybackend.DTOs.Messaging.SearchResult;
import com.example.coplaybackend.Services.Messaging.SearchService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/messages")
    public ResponseEntity<List<SearchResult>> searchMessages(@RequestParam String q) {
        String userId = SecurityUtils.getCurrentUserId();
        log.info("Searching messages for user: {} with query: {}", userId, q);

        List<SearchResult> results = searchService.searchMessages(userId, q);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/messages/count")
    public ResponseEntity<Map<String, Long>> getSearchCount(@RequestParam String q) {
        String userId = SecurityUtils.getCurrentUserId();
        long count = searchService.getTotalResults(userId, q);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<SearchResult>> searchInConversation(
            @PathVariable String conversationId,
            @RequestParam String q) {

        String userId = SecurityUtils.getCurrentUserId();
        log.info("Searching in conversation {} for user: {} with query: {}", conversationId, userId, q);

        List<SearchResult> results = searchService.searchInConversation(userId, conversationId, q);
        return ResponseEntity.ok(results);
    }
}