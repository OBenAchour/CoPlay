package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.HistoriqueAction;
import com.example.coplaybackend.Services.Teams.HistoriqueActionService;
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

    // Ajouter une action
    @PostMapping
    public ResponseEntity<HistoriqueAction> addAction(
            @PathVariable String teamId,
            @RequestBody HistoriqueAction action
    ) {
        // Associer automatiquement l'action à l'équipe
        action.setTeamId(teamId);
        HistoriqueAction savedAction = historiqueActionService.addAction(action);
        return ResponseEntity.ok(savedAction);
    }

    // Obtenir la liste des actions d'une équipe
    @GetMapping
    public ResponseEntity<List<HistoriqueAction>> getActions(@PathVariable String teamId) {
        List<HistoriqueAction> actions = historiqueActionService.getActionsByTeam(teamId);
        return ResponseEntity.ok(actions);
    }
}
