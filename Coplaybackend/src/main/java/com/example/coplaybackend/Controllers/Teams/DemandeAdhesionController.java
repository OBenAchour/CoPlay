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
@CrossOrigin(origins = "http://localhost:4200")
public class DemandeAdhesionController {

    private final DemandeAdhesionService service;
    private final TeamMemberService teamMemberService;

    @PostMapping("/join")
    public DemandeAdhesion join(
            @RequestParam String teamId,
            @RequestParam String userId,
            @RequestParam String proposedRole) {

        RoleEquipe role = RoleEquipe.valueOf(proposedRole);
        if (role == RoleEquipe.CAPTAIN) {
            throw new RuntimeException("Impossible de demander à rejoindre en tant que CAPTAIN");
        }

        return service.demanderAdhesion(teamId, userId, proposedRole);
    }

    @PutMapping("/accept/{id}")
    public DemandeAdhesion accept(
            @PathVariable String id,
            @RequestParam String captainId) {

        DemandeAdhesion demande = service.getDemandeById(id);
        if (!teamMemberService.isCaptain(demande.getTeamId(), captainId)) {
            throw new RuntimeException("Seul le capitaine peut accepter les demandes");
        }

        return service.accepterDemande(id, captainId);
    }

    @PutMapping("/refuse/{id}")
    public DemandeAdhesion refuse(
            @PathVariable String id,
            @RequestParam String captainId) {

        DemandeAdhesion demande = service.getDemandeById(id);
        if (!teamMemberService.isCaptain(demande.getTeamId(), captainId)) {
            throw new RuntimeException("Seul le capitaine peut refuser les demandes");
        }

        return service.refuserDemande(id, captainId);
    }

    @GetMapping("/my-demandes")
    public List<DemandeAdhesion> getMyDemandes(@RequestParam String userId) {
        return service.getDemandesByUser(userId);
    }

    @GetMapping("/team/{teamId}")
    public List<DemandeAdhesion> getDemandesByTeam(@PathVariable String teamId) {
        return service.getDemandesByTeam(teamId);
    }

    @DeleteMapping("/{id}")
    public void deleteDemande(@PathVariable String id) {
        service.deleteDemande(id);
    }

}