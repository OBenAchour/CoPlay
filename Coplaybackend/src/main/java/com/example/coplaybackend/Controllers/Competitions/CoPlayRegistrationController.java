package com.example.coplaybackend.Controllers.Competitions;

import com.example.coplaybackend.Entities.Competitions.Inscription;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Repositories.Competitions.InscriptionRepository;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/coplay/registrations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CoPlayRegistrationController {

    private final InscriptionRepository inscriptionRepo;
    private final TeamMemberService teamMemberService;

    @PostMapping("/apply")
    public ResponseEntity<?> applyToCompetition(
            @RequestParam String competitionId,
            @RequestParam String teamId,
            @RequestParam String userId) {

        // --- CORRECTION DU RÔLE ICI ---
        // On vérifie si l'utilisateur est le CAPTAIN de l'équipe
        boolean isLeader = teamMemberService.getMembers(teamId).stream()
                .anyMatch(m -> m.getUserId().equals(userId) && m.getRoleEquipe() == RoleEquipe.CAPTAIN);

        if (!isLeader) {
            return ResponseEntity.status(403).body("Seul le capitaine d'équipe peut inscrire l'équipe.");
        }

        Inscription inscription = Inscription.builder()
                .competitionId(competitionId)
                .teamId(teamId)
                .status("ACCEPTED")
                .registrationDate(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(inscriptionRepo.save(inscription));
    }
}