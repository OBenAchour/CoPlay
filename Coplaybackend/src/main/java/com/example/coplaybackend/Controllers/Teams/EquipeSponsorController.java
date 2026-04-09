package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.EquipeSponsor;
import com.example.coplaybackend.Services.Teams.EquipeSponsorService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sponsors")
@RequiredArgsConstructor
@Tag(name = "Equipe-sponsor-controller", description = "ajout sponsor-suppression-voir sponsor d'une équipe")

public class EquipeSponsorController {

    private final EquipeSponsorService sponsorService;

    // Ajouter un sponsor
    @PostMapping
    public EquipeSponsor addSponsor(@RequestParam String teamId,
                                    @RequestParam String sponsorName,
                                    @RequestParam String logoUrl) {
        return sponsorService.addSponsor(teamId, sponsorName, logoUrl);
    }

    // Liste des sponsors d'une équipe
    @GetMapping("/team/{teamId}")
    public List<EquipeSponsor> getSponsors(@PathVariable String teamId) {
        return sponsorService.getSponsorsByTeam(teamId);
    }

    // Supprimer un sponsor
    @DeleteMapping("/{sponsorId}")
    public void removeSponsor(@PathVariable String sponsorId) {
        sponsorService.removeSponsor(sponsorId);
    }
}
