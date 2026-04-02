package com.example.coplaybackend.Repositories.Teams;

import com.example.coplaybackend.Entities.Teams.TeamMember;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends MongoRepository<TeamMember,String> {

    List<TeamMember> findByTeamId(String teamId);

    Optional<TeamMember> findByTeamIdAndUserId(String teamId,String userId);

    List<TeamMember> findByUserId(String userId);

    Long countByTeamIdAndActiveTrue(String teamId);

}
