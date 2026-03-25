package com.example.coplaybackend.Controllers.Messaging;

import com.example.coplaybackend.Entities.Messaging.Conversation;
import com.example.coplaybackend.Entities.Messaging.ConversationType;
import com.example.coplaybackend.Services.Messaging.ConversationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConversationController {

    private final ConversationService conversationService;

    // ── POST /api/conversations ──────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Conversation> create(@RequestBody CreateConversationRequest req) {
        Conversation conv = conversationService.createConversation(
                req.getType(), req.getName(), req.getParticipantIds());
        return ResponseEntity.ok(conv);
    }

    // ── GET /api/conversations/user/{userId} ─────────────────────────────────
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Conversation>> getForUser(@PathVariable String userId) {
        return ResponseEntity.ok(conversationService.getConversationsForUser(userId));
    }

    // ── GET /api/conversations/{id} ──────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getOne(@PathVariable String id) {
        return ResponseEntity.ok(conversationService.getConversation(id));
    }

    // ── PATCH /api/conversations/{id}/archive ────────────────────────────────
    @PatchMapping("/{id}/archive")
    public ResponseEntity<Conversation> archive(@PathVariable String id) {
        return ResponseEntity.ok(conversationService.archiveConversation(id));
    }

    // ── GET /api/conversations/{id}/unread?userId=… ──────────────────────────
    @GetMapping("/{id}/unread")
    public ResponseEntity<Long> unreadCount(@PathVariable String id,
                                            @RequestParam String userId) {
        return ResponseEntity.ok(conversationService.countUnread(id, userId));
    }

    // ─── Inner request DTO ───────────────────────────────────────────────────
    @Data
    static class CreateConversationRequest {
        private ConversationType type;
        private String name;
        private List<String> participantIds;
    }
}