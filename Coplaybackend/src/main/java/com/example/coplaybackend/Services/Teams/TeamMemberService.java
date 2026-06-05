package com.example.coplaybackend.Services.Teams;

import com.example.coplaybackend.DTOs.Teams.MemberDTO;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.TeamMember;

import java.util.List;

public interface TeamMemberService {

    TeamMember addMember(String teamId, String userId, RoleEquipe role);

    void removeMember(String teamId, String userId);

    List<TeamMember> getMembers(String teamId);

    boolean isCaptain(String teamId, String userId);

    boolean isMember(String teamId, String userId);

    RoleEquipe getUserRole(String teamId, String userId);
    List<MemberDTO> getMembersWithUserInfo(String teamId);

    List<TeamMember> getMembersByUserId(String userId);
}