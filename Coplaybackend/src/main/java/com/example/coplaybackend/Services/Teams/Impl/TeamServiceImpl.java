package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.HistoriqueAction;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Entities.Teams.TeamStatus;
import com.example.coplaybackend.Repositories.Teams.DemandeAdhesionRepository;
import com.example.coplaybackend.Repositories.Teams.HistoriqueActionRepository;
import com.example.coplaybackend.Repositories.Teams.InvitationRepository;
import com.example.coplaybackend.Repositories.Teams.TeamMemberRepository;
import com.example.coplaybackend.Repositories.Teams.TeamRepository;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import com.example.coplaybackend.Services.Teams.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberService teamMemberService;
    private final TeamMemberRepository teamMemberRepository;
    private final DemandeAdhesionRepository demandeRepository;
    private final InvitationRepository invitationRepository;
    private final HistoriqueActionRepository historiqueRepository;

    @Override
    public Team createTeam(Team team, String creatorId) {
        team.setStatus(TeamStatus.ACTIVE);
        team.setCreatorId(creatorId);  // ← ASSOCIE À L'UTILISATEUR

        Team saved = teamRepository.save(team);

        // Le créateur devient CAPTAIN
        teamMemberService.addMember(saved.getTeamId(), creatorId, RoleEquipe.CAPTAIN);

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
    public List<Team> getTeamsByCreator(String creatorId) {
        return teamRepository.findByCreatorId(creatorId);
    }

    @Override
    public Team updateTeam(String teamId, Team team) {
        Team existing = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée"));

        existing.setName(team.getName());
        existing.setCity(team.getCity());
        existing.setDescription(team.getDescription());
        existing.setCapacityMax(team.getCapacityMax());
        existing.setSport(team.getSport());

        return teamRepository.save(existing);
    }

    @Override
    public void deleteTeam(String teamId) {
        try {
            log.info("🗑️ Suppression de l'équipe: {}", teamId);

            // Supprimer tous les membres
            teamMemberRepository.deleteByTeamId(teamId);
            log.info("✓ Membres supprimés");

            // Supprimer les demandes d'adhésion
            demandeRepository.deleteByTeamId(teamId);
            log.info("✓ Demandes supprimées");

            // Supprimer les invitations
            invitationRepository.deleteByTeamId(teamId);
            log.info("✓ Invitations supprimées");

            // Supprimer l'équipe
            teamRepository.deleteById(teamId);
            log.info("✓ Équipe supprimée avec succès");

        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression de l'équipe: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la suppression de l'équipe: " + e.getMessage());
        }
    }

    @Override
    public Team getTeamById(String teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée"));
    }

    @Override
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
}