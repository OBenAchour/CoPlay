package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.DemandeAdhesion;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Services.Teams.DemandeAdhesionService;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandes")
@RequiredArgsConstructor
@Tag(name = "Demande-adhesion-controller", description = "demande(user)-acceptation(captain)")

public class DemandeAdhesionController {

    private final DemandeAdhesionService service;
    private final TeamMemberService teamMemberService;

    @PostMapping("/join")
    public DemandeAdhesion join(
            @RequestParam String teamId,
            @RequestParam String userId,
            @RequestParam String proposedRole){

        RoleEquipe role = RoleEquipe.valueOf(proposedRole);
        if (role == RoleEquipe.CAPTAIN) {
            throw new RuntimeException("Cannot request to join as CAPTAIN.");
        }
        return service.demanderAdhesion(teamId,userId, proposedRole);
    }

    @PutMapping("/accept/{id}")
    public DemandeAdhesion accept(
            @PathVariable String id,
            @RequestParam String captainId){

        DemandeAdhesion demande = service.getDemandeById(id);
        if (!teamMemberService.isCaptain(demande.getTeamId(), captainId)) {
            throw new RuntimeException("Only team captain can accept join requests");
        }
        return service.accepterDemande(id, captainId);
    }

    @GetMapping("/my-demandes")
    public List<DemandeAdhesion> getMyDemandes(@RequestParam String userId) {
        return service.getDemandesByUser(userId);
    }

    @GetMapping("/team/{teamId}")
    public List<DemandeAdhesion> getDemandesByTeam(
            @PathVariable String teamId,
            @RequestParam String captainId) {
        if (!teamMemberService.isCaptain(teamId, captainId)) {
            throw new RuntimeException("Only team captain can view team requests");
        }
        return service.getDemandesByTeam(teamId);
    }

    @PutMapping("/refuse/{id}")
    public DemandeAdhesion refuse(
            @PathVariable String id,
            @RequestParam String captainId) {
        DemandeAdhesion demande = service.getDemandeById(id);
        if (!teamMemberService.isCaptain(demande.getTeamId(), captainId)) {
            throw new RuntimeException("Only team captain can refuse join requests");
        }
        return service.refuserDemande(id, captainId);
    }

    @DeleteMapping("/{id}")
    public void deleteDemande(@PathVariable String id) {
        service.deleteDemande(id);
    }

}
