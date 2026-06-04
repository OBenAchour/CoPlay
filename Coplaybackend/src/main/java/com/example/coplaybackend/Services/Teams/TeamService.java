package com.example.coplaybackend.Services.Teams;

import com.example.coplaybackend.Entities.Teams.Team;
import java.util.List;

public interface TeamService {

    Team createTeam(Team team, String creatorId);

    Team updateTeam(String teamId, Team team);

    void deleteTeam(String teamId);

    Team getTeamById(String teamId);

    List<Team> getAllTeams();

    List<Team> getTeamsByCreator(String creatorId);
}