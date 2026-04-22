package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.Invitation;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.StatutDemande;
import com.example.coplaybackend.Repositories.Teams.InvitationRepository;
import com.example.coplaybackend.Services.Teams.InvitationService;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvitationServiceImpl implements InvitationService {

    private final InvitationRepository invitationRepository;
    private final TeamMemberService teamMemberService;

    @Override
    public Invitation inviterUser(String teamId, String invitedUserId, String captainId) {

        Invitation invitation = Invitation.builder()
                .teamId(teamId)
                .invitedUserId(invitedUserId)
                .invitedByUserId(captainId)
                .statut(StatutDemande.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return invitationRepository.save(invitation);
    }

    @Override
    public Invitation accepterInvitation(String invitationId) {

        Invitation invitation = invitationRepository.findById(invitationId).orElseThrow();

        invitation.setStatut(StatutDemande.ACCEPTED);

        teamMemberService.addMember(
                invitation.getTeamId(),
                invitation.getInvitedUserId(),
                RoleEquipe.PLAYER
        );

        return invitationRepository.save(invitation);
    }

    @Override
    public Invitation refuserInvitation(String invitationId) {

        Invitation invitation = invitationRepository.findById(invitationId).orElseThrow();

        invitation.setStatut(StatutDemande.REJECTED);

        return invitationRepository.save(invitation);
    }

    @Override
    public List<Invitation> getInvitationsByUser(String userId) {
        return invitationRepository.findByInvitedUserId(userId);
    }

    @Override
    public List<Invitation> getInvitationsByTeam(String teamId) {
        return invitationRepository.findByTeamId(teamId);
    }
}
