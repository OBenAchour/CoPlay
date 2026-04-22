package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Services.Teams.TeamService;
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

    // 🔹 UPDATE
    @PutMapping("/{id}")
    public Team updateTeam(@PathVariable String id, @RequestBody Team team) {
        return teamService.updateTeam(id, team);
    }

    // 🔹 DELETE
    @DeleteMapping("/{id}")
    public void deleteTeam(@PathVariable String id) {
        teamService.deleteTeam(id);
    }

    @GetMapping("/my-teams")
    public List<Team> getMyTeams(@RequestParam String creatorId) {
        return teamService.getTeamsByCreator(creatorId);
    }



}
