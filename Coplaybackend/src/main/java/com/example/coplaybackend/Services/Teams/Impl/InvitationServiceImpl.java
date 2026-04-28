package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.HistoriqueAction;
import com.example.coplaybackend.Entities.Teams.Invitation;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.StatutDemande;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Repositories.Teams.HistoriqueActionRepository;
import com.example.coplaybackend.Repositories.Teams.InvitationRepository;
import com.example.coplaybackend.Repositories.Teams.TeamMemberRepository;
import com.example.coplaybackend.Repositories.Teams.TeamRepository;
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
    private final TeamRepository teamRepository;
    private final TeamMemberService teamMemberService;
    private final HistoriqueActionRepository historiqueRepository;
    private final TeamMemberRepository teamMemberRepository;

    @Override
    public Invitation inviterUser(String teamId, String invitedUserId, String captainId, RoleEquipe role) {

        if (role == RoleEquipe.CAPTAIN) {
            throw new RuntimeException("Cannot invite a player as CAPTAIN. Only the team creator can be captain.");
        }

        List<Invitation> pendingInvitations = invitationRepository.findByTeamIdAndInvitedUserIdAndStatut(
                teamId, invitedUserId, StatutDemande.PENDING);
        if (!pendingInvitations.isEmpty()) {
            throw new RuntimeException("This user already has a pending invitation for this team.");
        }

        Team team = teamRepository.findById(teamId).orElseThrow();

        Invitation invitation = Invitation.builder()
                .teamId(teamId)
                .teamName(team.getName())
                .invitedUserId(invitedUserId)
                .invitedByUserId(captainId)
                .proposedRole(role)
                .statut(StatutDemande.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        Invitation saved = invitationRepository.save(invitation);

        historiqueRepository.save(
                HistoriqueAction.builder()
                        .teamId(teamId)
                        .actorId(captainId)
                        .action("PLAYER_INVITED:" + invitedUserId)
                        .performedAt(LocalDateTime.now())
                        .build()
        );

        return saved;
    }

    @Override
    public Invitation accepterInvitation(String invitationId) {

        Invitation invitation = invitationRepository.findById(invitationId).orElseThrow();

        invitation.setStatut(StatutDemande.ACCEPTED);

        teamMemberService.addMember(
                invitation.getTeamId(),
                invitation.getInvitedUserId(),
                invitation.getProposedRole()
        );

        historiqueRepository.save(
                HistoriqueAction.builder()
                        .teamId(invitation.getTeamId())
                        .actorId(invitation.getInvitedUserId())
                        .action("INVITATION_ACCEPTED")
                        .performedAt(LocalDateTime.now())
                        .build()
        );

        return invitationRepository.save(invitation);
    }

    @Override
    public Invitation refuserInvitation(String invitationId) {

        Invitation invitation = invitationRepository.findById(invitationId).orElseThrow();

        invitation.setStatut(StatutDemande.REJECTED);

        historiqueRepository.save(
                HistoriqueAction.builder()
                        .teamId(invitation.getTeamId())
                        .actorId(invitation.getInvitedUserId())
                        .action("INVITATION_REJECTED")
                        .performedAt(LocalDateTime.now())
                        .build()
        );

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

    @Override
    public void deleteInvitation(String invitationId) {
        invitationRepository.deleteById(invitationId);
    }
}
