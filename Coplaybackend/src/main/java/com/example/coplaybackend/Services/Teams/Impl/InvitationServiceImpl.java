package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.Invitation;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.StatutDemande;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Repositories.Teams.InvitationRepository;
import com.example.coplaybackend.Repositories.Teams.TeamRepository;
import com.example.coplaybackend.Services.Teams.InvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvitationServiceImpl implements InvitationService {

    private final InvitationRepository invitationRepository;
    private final TeamRepository teamRepository;

    @Override
    public Invitation sendInvitation(String teamId, String invitedUserId, String captainId, RoleEquipe proposedRole) {
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty()) {
            throw new RuntimeException("Équipe non trouvée: " + teamId);
        }

        Team team = teamOpt.get();

        Invitation invitation = Invitation.builder()
                .teamId(teamId)
                .teamName(team.getName())
                .invitedUserId(invitedUserId)
                .invitedByUserId(captainId)
                .proposedRole(proposedRole)
                .statut(StatutDemande.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return invitationRepository.save(invitation);
    }

    @Override
    public List<Invitation> getSentInvitations(String teamId) {
        return invitationRepository.findByTeamId(teamId);
    }

    @Override
    public List<Invitation> getReceivedInvitations(String userId) {
        return invitationRepository.findByInvitedUserId(userId);
    }

    @Override
    public void acceptInvitation(String invitationId) {
        Optional<Invitation> invOpt = invitationRepository.findById(invitationId);
        if (invOpt.isEmpty()) {
            throw new RuntimeException("Invitation non trouvée: " + invitationId);
        }

        Invitation invitation = invOpt.get();
        invitation.setStatut(StatutDemande.ACCEPTED);
        invitationRepository.save(invitation);
    }

    @Override
    public void rejectInvitation(String invitationId) {
        Optional<Invitation> invOpt = invitationRepository.findById(invitationId);
        if (invOpt.isEmpty()) {
            throw new RuntimeException("Invitation non trouvée: " + invitationId);
        }

        Invitation invitation = invOpt.get();
        invitation.setStatut(StatutDemande.REJECTED);
        invitationRepository.save(invitation);
    }

    @Override
    public void deleteInvitation(String invitationId) {
        invitationRepository.deleteById(invitationId);
    }

    @Override
    public Invitation findById(String invitationId) {
        return invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation non trouvée: " + invitationId));
    }
}