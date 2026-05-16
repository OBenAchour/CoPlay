package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.PropositionCoach;
import com.example.coplaybackend.Services.Teams.CoachService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coaches")
@RequiredArgsConstructor
@Tag(name = "Coach-controller", description = "proposer un coach à une équipe, accepter ou refuser")
public class CoachController {

    private final CoachService coachService;

    @PostMapping
    public PropositionCoach proposer(
            @RequestParam String teamId,
            @RequestParam String coachId){

        return coachService.proposerCoach(teamId,coachId);
    }

    @PatchMapping("/{propositionId}/accept")
    public PropositionCoach accept(@PathVariable String propositionId) {
        return coachService.accepterProposition(propositionId);
    }

    @PatchMapping("/{propositionId}/refuse")
    public PropositionCoach refuse(@PathVariable String propositionId) {
        return coachService.refuserProposition(propositionId);
    }
}
