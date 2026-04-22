package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.DemandeAdhesion;
import com.example.coplaybackend.Entities.Teams.HistoriqueAction;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.StatutDemande;
import com.example.coplaybackend.Repositories.Teams.DemandeAdhesionRepository;
import com.example.coplaybackend.Repositories.Teams.HistoriqueActionRepository;
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

    @Override
    public DemandeAdhesion demanderAdhesion(String teamId, String userId) {

        DemandeAdhesion demande = DemandeAdhesion.builder()
                .teamId(teamId)
                .userId(userId)
                .statut(StatutDemande.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return demandeRepo.save(demande);
    }

    // Dans DemandeAdhesionServiceImpl.java — ajoute :
    @Override
    public List<DemandeAdhesion> getDemandesByUser(String userId) {
        return demandeRepo.findByUserId(userId);
    }

    @Override
    public List<DemandeAdhesion> getDemandesByTeam(String teamId) {
        return demandeRepo.findByTeamId(teamId);
    }

    @Override
    public DemandeAdhesion accepterDemande(String demandeId,String adminId) {

        DemandeAdhesion demande = demandeRepo.findById(demandeId).orElseThrow();

        demande.setStatut(StatutDemande.ACCEPTED);

        teamMemberService.addMember(
                demande.getTeamId(),
                demande.getUserId(),
                RoleEquipe.PLAYER
        );

        historiqueRepository.save(
                HistoriqueAction.builder()
                        .teamId(demande.getTeamId())
                        .actorId(adminId)
                        .action("JOIN_REQUEST_ACCEPTED")
                        .performedAt(LocalDateTime.now())
                        .build()
        );

        return demandeRepo.save(demande);
    }

    @Override
    public DemandeAdhesion refuserDemande(String demandeId,String adminId) {

        DemandeAdhesion demande = demandeRepo.findById(demandeId).orElseThrow();

        demande.setStatut(StatutDemande.REJECTED);

        return demandeRepo.save(demande);
    }
}
