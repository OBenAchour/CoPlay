package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.Invitation;
import com.example.coplaybackend.Services.Teams.InvitationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@Tag(name = "Invitation-controller", description = "inviter un joueur dans son équipe(captain)-refuser(joueur) pour rejoindre une autre équipe")

public class InvitationController {

    private final InvitationService service;

    @PostMapping
    public Invitation invite(
            @RequestParam String teamId,
            @RequestParam String invitedUserId,
            @RequestParam String captainId){

        return service.inviterUser(teamId,invitedUserId,captainId);
    }

}
