package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.DemandeAdhesion;
import com.example.coplaybackend.Services.Teams.DemandeAdhesionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandes")
@RequiredArgsConstructor
@Tag(name = "Demande-adhesion-controller", description = "demande(user)-acceptation(admin)")

public class DemandeAdhesionController {

    private final DemandeAdhesionService service;

    @PostMapping("/join")
    public DemandeAdhesion join(
            @RequestParam String teamId,
            @RequestParam String userId){

        return service.demanderAdhesion(teamId,userId);
    }

    @PutMapping("/accept/{id}")
    public DemandeAdhesion accept(
            @PathVariable String id,
            @RequestParam String adminId){

        return service.accepterDemande(id,adminId);
    }

    // Dans DemandeAdhesionController.java — ajoute :
    @GetMapping("/my-demandes")
    public List<DemandeAdhesion> getMyDemandes(@RequestParam String userId) {
        return service.getDemandesByUser(userId);
    }

    @GetMapping("/team/{teamId}")
    public List<DemandeAdhesion> getDemandesByTeam(@PathVariable String teamId) {
        return service.getDemandesByTeam(teamId);
    }

    // Et expose refuserDemande qui existe dans le service mais pas dans le controller !
    @PutMapping("/refuse/{id}")
    public DemandeAdhesion refuse(
            @PathVariable String id,
            @RequestParam String adminId) {
        return service.refuserDemande(id, adminId);
    }

}
