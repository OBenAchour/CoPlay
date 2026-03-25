package com.example.coplaybackend.Controllers.Messaging;

import com.example.coplaybackend.Entities.Messaging.Participant;
import com.example.coplaybackend.Entities.Messaging.ParticipantRole;
import com.example.coplaybackend.Services.Messaging.ParticipantService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations/{conversationId}/participants")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ParticipantController {

    private final ParticipantService participantService;

    // ── GET /api/conversations/{conversationId}/participants ─────────────────
    @GetMapping
    public ResponseEntity<List<Participant>> list(@PathVariable String conversationId) {
        return ResponseEntity.ok(participantService.getParticipants(conversationId));
    }

    // ── POST /api/conversations/{conversationId}/participants ────────────────
    @PostMapping
    public ResponseEntity<Participant> add(@PathVariable String conversationId,
                                           @RequestBody AddParticipantRequest req) {
        ParticipantRole role = req.getRole() != null
                ? ParticipantRole.valueOf(req.getRole().toUpperCase())
                : ParticipantRole.MEMBER;

        Participant p = participantService.addParticipant(conversationId, req.getUserId(), role);
        return ResponseEntity.ok(p);
    }

    // ── DELETE /api/conversations/{conversationId}/participants/{userId} ──────
    @DeleteMapping("/{userId}")
    public ResponseEntity<Participant> remove(@PathVariable String conversationId,
                                              @PathVariable String userId) {
        return ResponseEntity.ok(participantService.removeParticipant(conversationId, userId));
    }

    // ── PATCH /api/conversations/{conversationId}/participants/{userId}/role ──
    @PatchMapping("/{userId}/role")
    public ResponseEntity<Participant> updateRole(@PathVariable String conversationId,
                                                  @PathVariable String userId,
                                                  @RequestBody UpdateRoleRequest req) {
        ParticipantRole role = ParticipantRole.valueOf(req.getRole().toUpperCase());
        return ResponseEntity.ok(participantService.updateRole(conversationId, userId, role));
    }

    // ─── Inner request DTOs ───────────────────────────────────────────────────
    @Data
    static class AddParticipantRequest {
        private String userId;
        private String role;
    }

    @Data
    static class UpdateRoleRequest {
        private String role;
    }
}