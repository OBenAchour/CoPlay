package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.HistoriqueAction;
import com.example.coplaybackend.Services.Teams.HistoriqueActionService;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams/{teamId}/actions")
@RequiredArgsConstructor
@Tag(name = "Historique-action-controller", description = "ajout,récupération des actions d'une équipe")

public class HistoriqueActionController {

    private final HistoriqueActionService historiqueActionService;
    private final TeamMemberService teamMemberService;

    @PostMapping
    public ResponseEntity<HistoriqueAction> addAction(
            @PathVariable String teamId,
            @RequestBody HistoriqueAction action
    ) {
        if (!teamMemberService.isCaptain(teamId, action.getActorId())) {
            throw new RuntimeException("Only team captain can add manual actions");
        }
        action.setTeamId(teamId);
        HistoriqueAction savedAction = historiqueActionService.addAction(action);
        return ResponseEntity.ok(savedAction);
    }

    @GetMapping
    public ResponseEntity<List<HistoriqueAction>> getActions(
            @PathVariable String teamId,
            @RequestParam(required = false) String currentUserId
    ) {
        if (currentUserId != null && !teamMemberService.isMember(teamId, currentUserId)) {
            throw new RuntimeException("You must be a member of this team to view history");
        }
        List<HistoriqueAction> actions = historiqueActionService.getActionsByTeam(teamId);
        return ResponseEntity.ok(actions);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearActions(
            @PathVariable String teamId,
            @RequestParam String captainId
    ) {
        if (!teamMemberService.isCaptain(teamId, captainId)) {
            throw new RuntimeException("Only team captain can clear history");
        }
        historiqueActionService.clearActionsByTeam(teamId);
        return ResponseEntity.ok().build();
    }
}
