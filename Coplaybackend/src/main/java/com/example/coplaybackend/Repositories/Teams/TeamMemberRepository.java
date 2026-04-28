package com.example.coplaybackend.Repositories.Teams;

import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.TeamMember;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends MongoRepository<TeamMember,String> {

    List<TeamMember> findByTeamId(String teamId);

    List<TeamMember> findByTeamIdAndActiveTrue(String teamId);

    Optional<TeamMember> findByTeamIdAndUserId(String teamId,String userId);

    List<TeamMember> findByUserId(String userId);

    Optional<TeamMember> findByTeamIdAndUserIdAndActiveTrue(String teamId, String userId);


    Long countByTeamIdAndActiveTrue(String teamId);

    Long countByTeamIdAndRoleEquipeAndActiveTrue(String teamId, RoleEquipe role);

}
