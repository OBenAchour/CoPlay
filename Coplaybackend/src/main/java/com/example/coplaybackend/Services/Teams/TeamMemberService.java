package com.example.coplaybackend.Services.Teams;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.TeamMember;

import java.util.List;

public interface TeamMemberService {

    TeamMember addMember(String teamId, String userId, RoleEquipe role);

    void removeMember(String teamId,String userId);

    List<TeamMember> getMembers(String teamId);

}
