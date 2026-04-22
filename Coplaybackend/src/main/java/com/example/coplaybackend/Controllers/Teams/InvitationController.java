package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.Invitation;
import com.example.coplaybackend.Services.Teams.InvitationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@Tag(name = "Invitation-controller", description = "inviter un joueur dans son équipe(captain)-refuser(joueur) pour rejoindre une autre équipe")

public class InvitationController {

    private final InvitationService service;

    // Dans InvitationController.java — remplace tout :
    @PostMapping
    public Invitation invite(
            @RequestParam String teamId,
            @RequestParam String invitedUserId,
            @RequestParam String captainId) {
        return service.inviterUser(teamId, invitedUserId, captainId);
    }

    @PutMapping("/accept/{id}")
    public Invitation accept(@PathVariable String id) {
        return service.accepterInvitation(id);
    }

    @PutMapping("/refuse/{id}")
    public Invitation refuse(@PathVariable String id) {
        return service.refuserInvitation(id);
    }

    @GetMapping("/my-invitations")
    public List<Invitation> getMyInvitations(@RequestParam String userId) {
        return service.getInvitationsByUser(userId);
    }

    @GetMapping("/team/{teamId}")
    public List<Invitation> getByTeam(@PathVariable String teamId) {
        return service.getInvitationsByTeam(teamId);
    }

}
