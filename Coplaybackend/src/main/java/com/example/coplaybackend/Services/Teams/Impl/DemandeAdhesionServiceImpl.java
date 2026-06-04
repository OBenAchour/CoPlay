package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.DemandeAdhesion;
import com.example.coplaybackend.Entities.Teams.HistoriqueAction;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.StatutDemande;
import com.example.coplaybackend.Repositories.Teams.DemandeAdhesionRepository;
import com.example.coplaybackend.Repositories.Teams.HistoriqueActionRepository;
import com.example.coplaybackend.Repositories.Teams.TeamMemberRepository;
import com.example.coplaybackend.Services.Teams.DemandeAdhesionService;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemandeAdhesionServiceImpl implements DemandeAdhesionService {

    private final DemandeAdhesionRepository demandeRepo;
    private final TeamMemberService teamMemberService;
    private final HistoriqueActionRepository historiqueRepository;
    private final TeamMemberRepository teamMemberRepository;

    @Override
    public DemandeAdhesion demanderAdhesion(String teamId, String userId, String proposedRole) {

        if (RoleEquipe.valueOf(proposedRole) == RoleEquipe.CAPTAIN) {
            throw new RuntimeException("Impossible de demander à rejoindre en tant que CAPTAIN.");
        }

        List<DemandeAdhesion> pending = demandeRepo.findByTeamIdAndUserIdAndStatut(
                teamId, userId, StatutDemande.PENDING);
        if (!pending.isEmpty()) {
            throw new RuntimeException("Vous avez déjà une demande en attente pour cette équipe.");
        }

        DemandeAdhesion demande = DemandeAdhesion.builder()
                .teamId(teamId)
                .userId(userId)
                .proposedRole(RoleEquipe.valueOf(proposedRole))  // ✓ UTILISE proposedRole
                .statut(StatutDemande.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return demandeRepo.save(demande);
    }

    @Override
    public List<DemandeAdhesion> getDemandesByUser(String userId) {
        return demandeRepo.findByUserId(userId);
    }

    @Override
    public List<DemandeAdhesion> getDemandesByTeam(String teamId) {
        return demandeRepo.findByTeamId(teamId);
    }

    @Override
    public DemandeAdhesion getDemandeById(String demandeId) {
        return demandeRepo.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
    }

    @Override
    public void deleteDemande(String demandeId) {
        demandeRepo.deleteById(demandeId);
    }

    @Override
    public DemandeAdhesion accepterDemande(String demandeId, String captainId) {

        DemandeAdhesion demande = demandeRepo.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        demande.setStatut(StatutDemande.ACCEPTED);

        RoleEquipe role = demande.getProposedRole() != null ? demande.getProposedRole() : RoleEquipe.PLAYER;
        teamMemberService.addMember(demande.getTeamId(), demande.getUserId(), role);

        historiqueRepository.save(
                HistoriqueAction.builder()
                        .teamId(demande.getTeamId())
                        .actorId(captainId)
                        .action("JOIN_REQUEST_ACCEPTED")
                        .performedAt(LocalDateTime.now())
                        .build()
        );

        return demandeRepo.save(demande);
    }

    @Override
    public DemandeAdhesion refuserDemande(String demandeId, String captainId) {

        DemandeAdhesion demande = demandeRepo.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        demande.setStatut(StatutDemande.REJECTED);

        historiqueRepository.save(
                HistoriqueAction.builder()
                        .teamId(demande.getTeamId())
                        .actorId(captainId)
                        .action("JOIN_REQUEST_REJECTED")
                        .performedAt(LocalDateTime.now())
                        .build()
        );

        return demandeRepo.save(demande);
    }
}