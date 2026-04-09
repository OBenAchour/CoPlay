package com.example.coplaybackend.Controllers.Messaging;

import com.example.coplaybackend.DTOs.Messaging.AddParticipantRequest;
import com.example.coplaybackend.DTOs.Messaging.UpdateRoleRequest;
import com.example.coplaybackend.Entities.Messaging.Participant;
import com.example.coplaybackend.Entities.Messaging.ParticipantRole;
import com.example.coplaybackend.Services.Messaging.ParticipantService;
import com.example.coplaybackend.Utils.SecurityUtils; // Add this import
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/conversations/{conversationId}/participants")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ParticipantController {

    private final ParticipantService participantService;

    /**
     * GET /api/conversations/{conversationId}/participants - List all participants
     */
    @GetMapping
    public ResponseEntity<List<Participant>> list(@PathVariable String conversationId) {
        String requestingUserId = SecurityUtils.getCurrentUserId(); // Get authenticated user ID
        log.info("Fetching participants for conversation: {} by user: {}", conversationId, requestingUserId);
        return ResponseEntity.ok(participantService.getParticipants(conversationId, requestingUserId));
    }

    /**
     * POST /api/conversations/{conversationId}/participants - Add a participant
     */
    @PostMapping
    public ResponseEntity<Participant> add(@PathVariable String conversationId,
                                           @Valid @RequestBody AddParticipantRequest req) {
        String requestingUserId = SecurityUtils.getCurrentUserId(); // Get authenticated user ID
        log.info("Adding user: {} to conversation: {} by user: {}", req.getUserId(), conversationId, requestingUserId);
        ParticipantRole role = ParticipantRole.valueOf(req.getRole().toUpperCase());
        Participant p = participantService.addParticipant(conversationId, req.getUserId(), role, requestingUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(p);
    }

    /**
     * DELETE /api/conversations/{conversationId}/participants/{userId} - Remove a participant
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Participant> remove(@PathVariable String conversationId,
                                              @PathVariable String userId) {
        String requestingUserId = SecurityUtils.getCurrentUserId(); // Get authenticated user ID
        log.info("Removing user: {} from conversation: {} by user: {}", userId, conversationId, requestingUserId);
        return ResponseEntity.ok(participantService.removeParticipant(conversationId, userId, requestingUserId));
    }

    /**
     * PATCH /api/conversations/{conversationId}/participants/{userId}/role - Update participant role
     */
    @PatchMapping("/{userId}/role")
    public ResponseEntity<Participant> updateRole(@PathVariable String conversationId,
                                                  @PathVariable String userId,
                                                  @Valid @RequestBody UpdateRoleRequest req) {
        String requestingUserId = SecurityUtils.getCurrentUserId(); // Get authenticated user ID
        log.info("Updating role for user: {} in conversation: {} to: {} by user: {}", userId, conversationId, req.getRole(), requestingUserId);
        ParticipantRole role = ParticipantRole.valueOf(req.getRole().toUpperCase());
        return ResponseEntity.ok(participantService.updateRole(conversationId, userId, role, requestingUserId));
    }
}
