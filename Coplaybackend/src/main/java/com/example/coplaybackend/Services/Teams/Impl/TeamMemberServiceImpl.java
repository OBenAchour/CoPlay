package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.DTOs.Teams.MemberDTO;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Entities.Teams.TeamMember;
import com.example.coplaybackend.Repositories.Auth.UserRepository;
import com.example.coplaybackend.Repositories.Teams.TeamMemberRepository;
import com.example.coplaybackend.Repositories.Teams.TeamRepository;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;  // ← AJOUTER CETTE DÉPENDANCE

    @Override
    public TeamMember addMember(String teamId, String userId, RoleEquipe role) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée"));

        var existing = teamMemberRepository.findByTeamIdAndUserId(teamId, userId);
        if (existing.isPresent()) {
            TeamMember member = existing.get();
            member.setActive(true);
            member.setRoleEquipe(role);
            member.setJoinedAt(LocalDate.now());
            return teamMemberRepository.save(member);
        }

        if (role == RoleEquipe.PLAYER) {
            long playerCount = teamMemberRepository.countByTeamIdAndRoleEquipeAndActiveTrue(teamId, RoleEquipe.PLAYER);
            if (playerCount >= team.getCapacityMax()) {
                throw new RuntimeException("Nombre maximum de joueurs atteint pour " + team.getSport());
            }
        }

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
    public void removeMember(String teamId, String userId) {
        TeamMember member = teamMemberRepository
                .findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException("Membre non trouvé"));

        member.setActive(false);
        teamMemberRepository.save(member);
    }

    @Override
    public List<TeamMember> getMembers(String teamId) {
        return teamMemberRepository.findByTeamIdAndActiveTrue(teamId);
    }

    @Override
    public boolean isCaptain(String teamId, String userId) {
        return teamMemberRepository
                .findByTeamIdAndUserIdAndActiveTrue(teamId, userId)
                .map(m -> m.getRoleEquipe() == RoleEquipe.CAPTAIN)
                .orElse(false);
    }

    @Override
    public boolean isMember(String teamId, String userId) {
        return teamMemberRepository
                .findByTeamIdAndUserIdAndActiveTrue(teamId, userId)
                .isPresent();
    }

    @Override
    public RoleEquipe getUserRole(String teamId, String userId) {
        return teamMemberRepository
                .findByTeamIdAndUserIdAndActiveTrue(teamId, userId)
                .map(TeamMember::getRoleEquipe)
                .orElse(null);
    }

    @Override
    public List<MemberDTO> getMembersWithUserInfo(String teamId) {
        List<TeamMember> members = teamMemberRepository.findByTeamIdAndActiveTrue(teamId);

        return members.stream()
                .map(member -> {
                    User user = userRepository.findById(member.getUserId())
                            .orElse(null);

                    if (user == null) {
                        return null; // Skip si user introuvable
                    }

                    return MemberDTO.builder()
                            .memberId(member.getId())
                            .userId(member.getUserId())
                            .displayName(user.getProfile() != null ?
                                    user.getProfile().getDisplayName() : user.getEmail())
                            .email(user.getEmail())
                            .roleEquipe(member.getRoleEquipe().toString())
                            .avatarUrl(null) // À ajouter plus tard si vous avez des avatars
                            .active(member.getActive())
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamMember> getMembersByUserId(String userId) {
        return teamMemberRepository.findByUserId(userId);
    }
}