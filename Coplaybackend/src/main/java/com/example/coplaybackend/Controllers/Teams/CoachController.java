package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.PropositionCoach;
import com.example.coplaybackend.Services.Teams.CoachService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coaches")
@RequiredArgsConstructor
@Tag(name = "Coach-controller", description = "proposer un coach à une équipe")

public class CoachController {

    private final CoachService coachService;

    // Dans CoachController.java — remplace tout :
    @PostMapping
    public PropositionCoach proposer(
            @RequestParam String teamId,
            @RequestParam String coachId) {
        return coachService.proposerCoach(teamId, coachId);
    }

    @PutMapping("/accept/{id}")
    public PropositionCoach accept(@PathVariable String id) {
        return coachService.accepterProposition(id);
    }

    @PutMapping("/refuse/{id}")
    public PropositionCoach refuse(@PathVariable String id) {
        return coachService.refuserProposition(id);
    }

    @GetMapping("/team/{teamId}")
    public List<PropositionCoach> getByTeam(@PathVariable String teamId) {
        return coachService.getPropositionsByTeam(teamId);
    }

    @GetMapping("/my-propositions")
    public List<PropositionCoach> getMyPropositions(@RequestParam String coachId) {
        return coachService.getPropositionsByCoach(coachId);
    }

}
