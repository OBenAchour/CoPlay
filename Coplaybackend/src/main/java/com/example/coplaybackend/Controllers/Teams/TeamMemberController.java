package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.TeamMember;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams/{teamId}/members")
@RequiredArgsConstructor
@Tag(name = "Team-member-controller", description = "ajout/suppression/lister les membres d'une équipe ")

public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    // Ajouter un membre à une équipe
    @PostMapping
    public ResponseEntity<TeamMember> addMember(
            @PathVariable String teamId,
            @RequestParam String userId,
            @RequestParam RoleEquipe role
    ) {
        TeamMember member = teamMemberService.addMember(teamId, userId, role);
        return ResponseEntity.ok(member);
    }

    // Supprimer (désactiver) un membre
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable String teamId,
            @PathVariable String userId
    ) {
        teamMemberService.removeMember(teamId, userId);
        return ResponseEntity.noContent().build();
    }

    // Obtenir la liste des membres d'une équipe
    @GetMapping
    public ResponseEntity<List<TeamMember>> getMembers(@PathVariable String teamId) {
        List<TeamMember> members = teamMemberService.getMembers(teamId);
        return ResponseEntity.ok(members);
    }
}
