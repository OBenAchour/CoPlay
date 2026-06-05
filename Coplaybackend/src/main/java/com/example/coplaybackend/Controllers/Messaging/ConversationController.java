package com.example.coplaybackend.Controllers.Messaging;

import com.example.coplaybackend.DTOs.Messaging.CreateConversationRequest;
import com.example.coplaybackend.Entities.Messaging.Conversation;
import com.example.coplaybackend.Services.Messaging.ConversationService;
import com.example.coplaybackend.Utils.SecurityUtils; // Add this import
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.coplaybackend.DTOs.Messaging.ConversationListItem;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ConversationController {

    private final ConversationService conversationService;

    /**
     * POST /api/conversations - Create a new conversation
     */
    @PostMapping
    public ResponseEntity<Conversation> create(@Valid @RequestBody CreateConversationRequest req) {
        // Note: Optionally add the creator as a participant with admin role
        String creatorId = SecurityUtils.getCurrentUserId();
        log.info("Creating conversation of type: {} by user: {}", req.getType(), creatorId);
        Conversation conv = conversationService.createConversation(
                req.getType(), req.getName(), req.getParticipantIds());
        // If you want to auto-add creator: participantService.addParticipant(conv.getId(), creatorId, ParticipantRole.ADMIN);
        return ResponseEntity.status(HttpStatus.CREATED).body(conv);
    }

    /**
     * GET /api/conversations - Get all conversations for the authenticated user
     */
    @GetMapping

    public ResponseEntity<List<ConversationListItem>> getForUser() {
        String userId = SecurityUtils.getCurrentUserId();
        log.info("Fetching conversations for user: {}", userId);
        return ResponseEntity.ok(List.of());  // ← Retourne une liste vide pour l'instant

    }

    /**
     * GET /api/conversations/{id} - Get a specific conversation
     */
    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getOne(@PathVariable String id) {
        String requestingUserId = SecurityUtils.getCurrentUserId(); // Get authenticated user ID
        log.info("Fetching conversation: {} for user: {}", id, requestingUserId);
        return ResponseEntity.ok(conversationService.getConversation(id, requestingUserId));
    }

    /**
     * PATCH /api/conversations/{id}/archive - Archive a conversation
     */
    @PatchMapping("/{id}/archive")
    public ResponseEntity<Conversation> archive(@PathVariable String id) {
        String requestingUserId = SecurityUtils.getCurrentUserId(); // Get authenticated user ID
        log.info("Archiving conversation: {} by user: {}", id, requestingUserId);
        return ResponseEntity.ok(conversationService.archiveConversation(id, requestingUserId));
    }

    /**
     * GET /api/conversations/{id}/unread - Get unread message count
     */
    @GetMapping("/{id}/unread")
    public ResponseEntity<Long> unreadCount(@PathVariable String id) {
        String userId = SecurityUtils.getCurrentUserId(); // Get authenticated user ID
        log.info("Fetching unread count for conversation: {} and user: {}", id, userId);
        return ResponseEntity.ok(conversationService.countUnread(id, userId));
    }

}
