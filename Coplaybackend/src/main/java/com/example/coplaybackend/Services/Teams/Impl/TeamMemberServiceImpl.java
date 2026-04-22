package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Entities.Teams.TeamMember;
import com.example.coplaybackend.Repositories.Teams.TeamMemberRepository;
import com.example.coplaybackend.Repositories.Teams.TeamRepository;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;

    @Override
    public TeamMember addMember(String teamId, String userId, RoleEquipe role) {

        Team team = teamRepository.findById(teamId).orElseThrow();

        long count = teamMemberRepository.countByTeamIdAndActiveTrue(teamId);

        if(count >= team.getCapacityMax())
            throw new RuntimeException("Team is full");

        TeamMember member = TeamMember.builder()
                .teamId(teamId)
                .userId(userId)
                .roleEquipe(role)
                .joinedAt(LocalDate.now())
                .active(true)
                .build();

        return teamMemberRepository.save(member);
    }

    @Override
    public void removeMember(String teamId,String userId) {

        TeamMember member = teamMemberRepository
                .findByTeamIdAndUserId(teamId,userId)
                .orElseThrow();

        member.setActive(false);

        teamMemberRepository.save(member);
    }

    @Override
    public List<TeamMember> getMembers(String teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }

    @Override
    public boolean isCaptain(String teamId, String userId) {
        return teamMemberRepository
                .findByTeamIdAndUserIdAndActiveTrue(teamId, userId)
                .map(m -> m.getRoleEquipe() == RoleEquipe.CAPTAIN)
                .orElse(false);
    }

    @Override
    public List<TeamMember> getMembersByUserId(String userId) {
        return teamMemberRepository.findByUserId(userId);
    }
}
