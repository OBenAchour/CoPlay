package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.DemandeAdhesion;
import com.example.coplaybackend.Services.Teams.DemandeAdhesionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

}
