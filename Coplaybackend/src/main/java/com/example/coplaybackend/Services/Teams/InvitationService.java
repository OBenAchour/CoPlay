package com.example.coplaybackend.Services.Teams;
import com.example.coplaybackend.Entities.Teams.Invitation;

public interface InvitationService {

    Invitation inviterUser(String teamId, String invitedUserId, String captainId);

    Invitation accepterInvitation(String invitationId);

    Invitation refuserInvitation(String invitationId);

}
