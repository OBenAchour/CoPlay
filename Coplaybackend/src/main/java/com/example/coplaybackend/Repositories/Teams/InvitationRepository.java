package com.example.coplaybackend.Repositories.Teams;

import com.example.coplaybackend.Entities.Teams.Invitation;
import com.example.coplaybackend.Entities.Teams.StatutDemande;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InvitationRepository extends MongoRepository<Invitation, String> {

    List<Invitation> findByInvitedUserId(String userId);

    List<Invitation> findByTeamId(String teamId);

    List<Invitation> findByTeamIdAndInvitedUserIdAndStatut(String teamId, String invitedUserId, StatutDemande statut);

    void deleteByTeamId(String teamId);  // ← AJOUTE
}