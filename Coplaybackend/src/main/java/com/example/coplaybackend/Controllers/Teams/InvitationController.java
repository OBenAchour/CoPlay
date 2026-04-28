package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.Invitation;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Services.Teams.InvitationService;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@Tag(name = "Invitation-controller", description = "inviter un joueur dans son équipe(captain)-refuser(joueur) pour rejoindre une autre équipe")
@CrossOrigin(origins = "http://localhost:4200")

public class InvitationController {

    private final InvitationService service;
    private final TeamMemberService teamMemberService;

    @PostMapping
    public Invitation invite(
            @RequestParam String teamId,
            @RequestParam String invitedUserId,
            @RequestParam String captainId,
            @RequestParam RoleEquipe role) {
        if (!teamMemberService.isCaptain(teamId, captainId)) {
            throw new RuntimeException("Only team captain can invite players");
        }
        return service.inviterUser(teamId, invitedUserId, captainId, role);
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
    public List<Invitation> getByTeam(
            @PathVariable String teamId,
            @RequestParam String captainId) {
        if (!teamMemberService.isCaptain(teamId, captainId)) {
            throw new RuntimeException("Only team captain can view team invitations");
        }
        return service.getInvitationsByTeam(teamId);
    }

    @DeleteMapping("/{id}")
    public void deleteInvitation(@PathVariable String id) {
        service.deleteInvitation(id);
    }

}
