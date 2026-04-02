package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.HistoriqueAction;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Entities.Teams.TeamStatus;
import com.example.coplaybackend.Repositories.Teams.HistoriqueActionRepository;
import com.example.coplaybackend.Repositories.Teams.TeamRepository;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import com.example.coplaybackend.Services.Teams.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberService teamMemberService;
    private final HistoriqueActionRepository historiqueRepository;

    @Override
    public Team createTeam(Team team, String creatorId) {

        team.setStatus(TeamStatus.ACTIVE);

        Team saved = teamRepository.save(team);

        teamMemberService.addMember(saved.getTeamId(),creatorId, RoleEquipe.CAPTAIN);

        historiqueRepository.save(
                HistoriqueAction.builder()
                        .teamId(saved.getTeamId())
                        .actorId(creatorId)
                        .action("TEAM_CREATED")
                        .performedAt(LocalDateTime.now())
                        .build()
        );

        return saved;
    }

    @Override
    public Team updateTeam(String teamId,Team team) {

        Team existing = teamRepository.findById(teamId).orElseThrow();

        existing.setName(team.getName());
        existing.setCity(team.getCity());
        existing.setDescription(team.getDescription());
        existing.setCapacityMax(team.getCapacityMax());

        return teamRepository.save(existing);
    }

    @Override
    public void deleteTeam(String teamId) {
        teamRepository.deleteById(teamId);
    }

    @Override
    public Team getTeamById(String teamId) {
        return teamRepository.findById(teamId).orElseThrow();
    }

    @Override
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
}
