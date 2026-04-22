package com.example.coplaybackend.Services.Teams;
import com.example.coplaybackend.Entities.Teams.Invitation;

import java.util.List;

public interface InvitationService {

    Invitation inviterUser(String teamId, String invitedUserId, String captainId);

    Invitation accepterInvitation(String invitationId);

    Invitation refuserInvitation(String invitationId);

    // Dans l'interface InvitationService.java — ajoute :
    List<Invitation> getInvitationsByUser(String userId);
    List<Invitation> getInvitationsByTeam(String teamId);

}
