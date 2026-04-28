package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Services.Teams.TeamService;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Tag(name = "Team-controller", description = "création-affichage-détails(équipe)")
@CrossOrigin(origins = "http://localhost:4200")
public class TeamController {

    private final TeamService teamService;
    private final TeamMemberService teamMemberService;

    @PostMapping
    public Team create(@RequestBody Team team, @RequestParam String creatorId){
        return teamService.createTeam(team,creatorId);
    }

    @GetMapping
    public List<Team> getAll(){
        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public Team getById(@PathVariable String id){
        return teamService.getTeamById(id);
    }

    @PutMapping("/{id}")
    public Team updateTeam(@PathVariable String id, @RequestBody Team team,
                          @RequestParam String currentUserId) {
        if (!teamMemberService.isCaptain(id, currentUserId)) {
            throw new RuntimeException("Only team captain can update the team");
        }
        return teamService.updateTeam(id, team);
    }

    @DeleteMapping("/{id}")
    public void deleteTeam(@PathVariable String id, @RequestParam String currentUserId) {
        if (!teamMemberService.isCaptain(id, currentUserId)) {
            throw new RuntimeException("Only team captain can delete the team");
        }
        teamService.deleteTeam(id);
    }

    @GetMapping("/my-teams")
    public List<Team> getMyTeams(@RequestParam String creatorId) {
        return teamService.getTeamsByCreator(creatorId);
    }

    @GetMapping("/{teamId}/captain/{userId}")
    public boolean isCaptain(@PathVariable String teamId, @PathVariable String userId) {
        return teamMemberService.isCaptain(teamId, userId);
    }

    @GetMapping("/{teamId}/role/{userId}")
    public String getUserRole(@PathVariable String teamId, @PathVariable String userId) {
        var role = teamMemberService.getUserRole(teamId, userId);
        return role != null ? role.name() : "NONE";
    }

}
