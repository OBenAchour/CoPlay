package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Config.JwtUtils;
import com.example.coplaybackend.DTOs.Teams.MemberDTO;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Services.Teams.TeamService;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Tag(name = "Team-controller", description = "création-affichage-détails(équipe)")
@CrossOrigin(origins = "http://localhost:4200")
public class TeamController {

    private final TeamService teamService;
    private final TeamMemberService teamMemberService;
    private final JwtUtils jwtUtils;  // ← AJOUTER CETTE DÉPENDANCE

    @PostMapping
    @Operation(summary = "Créer une équipe")
    public Team create(@RequestBody Team team, @RequestParam String creatorId) {
        return teamService.createTeam(team, creatorId);
    }

    @GetMapping
    @Operation(summary = "Récupérer toutes les équipes")
    public List<Team> getAll() {
        return teamService.getAllTeams();
    }

    @GetMapping("/detail/{teamId}")
    @Operation(summary = "Récupérer une équipe avec détails et membres")
    public ResponseEntity<?> getTeamDetail(@PathVariable String teamId,
                                           @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            Team team = teamService.getTeamById(teamId);
            List<MemberDTO> members = teamMemberService.getMembersWithUserInfo(teamId);

            Map<String, Object> response = new HashMap<>();
            response.put("team", team);
            response.put("members", members);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une équipe par ID")
    public Team getById(@PathVariable String id) {
        return teamService.getTeamById(id);
    }

    @GetMapping("/creator/{creatorId}")
    @Operation(summary = "Récupérer les équipes créées par un utilisateur")
    public List<Team> getTeamsByCreator(@PathVariable String creatorId) {
        return teamService.getTeamsByCreator(creatorId);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une équipe")
    public Team updateTeam(@PathVariable String id,
                           @RequestBody Team team,
                           @RequestParam String currentUserId) {
        if (!teamMemberService.isCaptain(id, currentUserId)) {
            throw new RuntimeException("Seul le capitaine peut modifier l'équipe");
        }
        return teamService.updateTeam(id, team);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une équipe")
    public ResponseEntity<?> deleteTeam(@PathVariable String id, @RequestParam String currentUserId) {
        if (!teamMemberService.isCaptain(id, currentUserId)) {
            throw new RuntimeException("Seul le capitaine peut supprimer l'équipe");
        }
        teamService.deleteTeam(id);
        return ResponseEntity.ok(Map.of("message", "Équipe supprimée avec succès"));
    }

    @GetMapping("/{teamId}/captain/{userId}")
    @Operation(summary = "Vérifier si un utilisateur est capitaine")
    public boolean isCaptain(@PathVariable String teamId, @PathVariable String userId) {
        return teamMemberService.isCaptain(teamId, userId);
    }

    @GetMapping("/{teamId}/member/{userId}")
    @Operation(summary = "Vérifier si un utilisateur est membre")
    public boolean isMember(@PathVariable String teamId, @PathVariable String userId) {
        return teamMemberService.isMember(teamId, userId);
    }

    @GetMapping("/{teamId}/role/{userId}")
    @Operation(summary = "Récupérer le rôle d'un utilisateur dans une équipe")
    public String getUserRole(@PathVariable String teamId, @PathVariable String userId) {
        var role = teamMemberService.getUserRole(teamId, userId);
        return role != null ? role.name() : "NONE";
    }
}