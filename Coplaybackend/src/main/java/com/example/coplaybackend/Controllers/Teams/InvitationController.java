package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.Invitation;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Services.Teams.InvitationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping
    public ResponseEntity<?> sendInvitation(
            @RequestParam String teamId,
            @RequestParam String invitedUserId,
            @RequestParam String captainId,
            @RequestParam(required = false, defaultValue = "PLAYER") String role) {
        try {
            RoleEquipe roleEquipe = RoleEquipe.valueOf(role.toUpperCase());
            Invitation invitation = invitationService.sendInvitation(teamId, invitedUserId, captainId, roleEquipe);
            return ResponseEntity.ok(invitation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/sent/{teamId}")
    public ResponseEntity<?> getSentInvitations(@PathVariable String teamId) {
        try {
            List<Invitation> invitations = invitationService.getSentInvitations(teamId);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/received")
    public ResponseEntity<?> getReceivedInvitations(@RequestParam String userId) {
        try {
            List<Invitation> invitations = invitationService.getReceivedInvitations(userId);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur: " + e.getMessage());
        }
    }

    @PostMapping("/{invitationId}/accept")
    public ResponseEntity<?> acceptInvitation(@PathVariable String invitationId) {
        try {
            invitationService.acceptInvitation(invitationId);
            return ResponseEntity.ok("Invitation acceptée");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur: " + e.getMessage());
        }
    }

    @PostMapping("/{invitationId}/reject")
    public ResponseEntity<?> rejectInvitation(@PathVariable String invitationId) {
        try {
            invitationService.rejectInvitation(invitationId);
            return ResponseEntity.ok("Invitation refusée");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/{invitationId}")
    public ResponseEntity<?> deleteInvitation(@PathVariable String invitationId) {
        try {
            invitationService.deleteInvitation(invitationId);
            return ResponseEntity.ok("Invitation supprimée");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur: " + e.getMessage());
        }
    }
}