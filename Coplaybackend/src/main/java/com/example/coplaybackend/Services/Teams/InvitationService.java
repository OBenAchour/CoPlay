package com.example.coplaybackend.Services.Teams;
import com.example.coplaybackend.Entities.Teams.Invitation;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;

import java.util.List;

public interface InvitationService {

    Invitation inviterUser(String teamId, String invitedUserId, String captainId, RoleEquipe role);

    Invitation accepterInvitation(String invitationId);

    Invitation refuserInvitation(String invitationId);

    void deleteInvitation(String invitationId);

    List<Invitation> getInvitationsByUser(String userId);
    List<Invitation> getInvitationsByTeam(String teamId);

}
