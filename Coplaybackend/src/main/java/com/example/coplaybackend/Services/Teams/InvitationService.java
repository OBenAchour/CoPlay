package com.example.coplaybackend.Services.Teams;

import com.example.coplaybackend.Entities.Teams.Invitation;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;

import java.util.List;

public interface InvitationService {

    Invitation sendInvitation(String teamId, String invitedUserId, String captainId, RoleEquipe proposedRole);

    List<Invitation> getSentInvitations(String teamId);

    List<Invitation> getReceivedInvitations(String userId);

    void acceptInvitation(String invitationId);

    void rejectInvitation(String invitationId);

    void deleteInvitation(String invitationId);

    Invitation findById(String invitationId);
}