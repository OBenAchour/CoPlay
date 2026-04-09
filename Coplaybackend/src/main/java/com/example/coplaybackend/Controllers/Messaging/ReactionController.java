package com.example.coplaybackend.Controllers.Messaging;

import com.example.coplaybackend.Entities.Messaging.MessageReaction;
import com.example.coplaybackend.Entities.Messaging.ReactionType;
import com.example.coplaybackend.Services.Messaging.ReactionService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ReactionController {

    private final ReactionService reactionService;

    @PostMapping("/{messageId}/reactions")
    public ResponseEntity<MessageReaction> addOrUpdateReaction(
            @PathVariable String messageId,
            @RequestBody Map<String, String> request) {

        String userId = SecurityUtils.getCurrentUserId();
        ReactionType reactionType = ReactionType.valueOf(request.get("reactionType"));

        MessageReaction reaction = reactionService.addOrUpdateReaction(messageId, userId, reactionType);
        return ResponseEntity.ok(reaction);
    }

    @DeleteMapping("/{messageId}/reactions")
    public ResponseEntity<Void> removeReaction(@PathVariable String messageId) {
        String userId = SecurityUtils.getCurrentUserId();
        reactionService.removeReaction(messageId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{messageId}/reactions")
    public ResponseEntity<List<MessageReaction>> getReactions(@PathVariable String messageId) {
        return ResponseEntity.ok(reactionService.getReactionsForMessage(messageId));
    }

    @GetMapping("/{messageId}/reactions/counts")
    public ResponseEntity<Map<ReactionType, Long>> getReactionCounts(@PathVariable String messageId) {
        return ResponseEntity.ok(reactionService.getReactionCountsForMessage(messageId));
    }

    @GetMapping("/{messageId}/reactions/user")
    public ResponseEntity<Map<String, String>> getUserReaction(@PathVariable String messageId) {
        String userId = SecurityUtils.getCurrentUserId();
        Optional<ReactionType> reaction = reactionService.getUserReaction(messageId, userId);

        Map<String, String> response = new HashMap<>();
        reaction.ifPresent(r -> response.put("reactionType", r.name()));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{messageId}/reactions/summary")
    public ResponseEntity<Map<String, Object>> getReactionSummary(@PathVariable String messageId) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("counts", reactionService.getReactionCountsForMessage(messageId));
        summary.put("total", reactionService.getTotalReactionCount(messageId));

        String userId = SecurityUtils.getCurrentUserId();
        reactionService.getUserReaction(messageId, userId)
                .ifPresent(r -> summary.put("userReaction", r.name()));

        return ResponseEntity.ok(summary);
    }
}