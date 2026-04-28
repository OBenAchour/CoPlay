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
@CrossOrigin(origins = "http://localhost:4200")

public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @PostMapping
    public ResponseEntity<TeamMember> addMember(
            @PathVariable String teamId,
            @RequestParam String userId,
            @RequestParam String captainId,
            @RequestParam RoleEquipe role
    ) {
        if (!teamMemberService.isCaptain(teamId, captainId)) {
            throw new RuntimeException("Only team captain can add members");
        }
        TeamMember member = teamMemberService.addMember(teamId, userId, role);
        return ResponseEntity.ok(member);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable String teamId,
            @PathVariable String userId,
            @RequestParam String captainId
    ) {
        if (!teamMemberService.isCaptain(teamId, captainId)) {
            throw new RuntimeException("Only team captain can remove members");
        }
        teamMemberService.removeMember(teamId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<TeamMember>> getMembers(@PathVariable String teamId,
                                             @RequestParam(required = false) String currentUserId) {
        if (currentUserId != null && !teamMemberService.isMember(teamId, currentUserId)) {
            throw new RuntimeException("You must be a member of this team to view members");
        }
        List<TeamMember> members = teamMemberService.getMembers(teamId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/is-captain")
    public ResponseEntity<Boolean> isCaptain(
            @PathVariable String teamId,
            @RequestParam String userId) {
        return ResponseEntity.ok(teamMemberService.isCaptain(teamId, userId));
    }

    @GetMapping("/my-role")
    public ResponseEntity<String> getMyRole(
            @PathVariable String teamId,
            @RequestParam String userId) {
        var role = teamMemberService.getUserRole(teamId, userId);
        return ResponseEntity.ok(role != null ? role.name() : "NONE");
    }

}
