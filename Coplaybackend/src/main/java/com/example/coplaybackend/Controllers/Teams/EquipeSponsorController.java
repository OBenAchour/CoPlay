package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.EquipeSponsor;
import com.example.coplaybackend.Services.Teams.EquipeSponsorService;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
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
    private final TeamMemberService teamMemberService;

    @PostMapping
    public EquipeSponsor addSponsor(
            @RequestParam String teamId,
            @RequestParam String captainId,
            @RequestParam String sponsorName,
            @RequestParam String logoUrl,
            @RequestParam String link) {
        if (!teamMemberService.isCaptain(teamId, captainId)) {
            throw new RuntimeException("Only team captain can add sponsors");
        }
        return sponsorService.addSponsor(teamId, captainId, sponsorName, logoUrl, link);
    }

    @GetMapping("/team/{teamId}")
    public List<EquipeSponsor> getSponsors(@PathVariable String teamId) {
        return sponsorService.getSponsorsByTeam(teamId);
    }

    @DeleteMapping("/{sponsorId}")
    public void removeSponsor(
            @PathVariable String sponsorId,
            @RequestParam String captainId,
            @RequestParam String teamId) {
        if (!teamMemberService.isCaptain(teamId, captainId)) {
            throw new RuntimeException("Only team captain can remove sponsors");
        }
        sponsorService.removeSponsor(sponsorId, captainId);
    }
}
