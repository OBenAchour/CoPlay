package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.PropositionCoach;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.StatutDemande;
import com.example.coplaybackend.Repositories.Teams.PropositionCoachRepository;
import com.example.coplaybackend.Services.Marketplace.MarketplaceProductService;
import com.example.coplaybackend.Services.Teams.CoachService;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CoachServiceImpl implements CoachService {

    private final PropositionCoachRepository repository;
    private final TeamMemberService teamMemberService;
    private final MarketplaceProductService marketplaceProductService;

    @Override
    public PropositionCoach proposerCoach(String teamId, String coachId) {

        PropositionCoach proposition = PropositionCoach.builder()
                .teamId(teamId)
                .coachId(coachId)
                .statut(StatutDemande.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return repository.save(proposition);
    }

    @Override
    public PropositionCoach accepterProposition(String propositionId) {

        PropositionCoach proposition = repository.findById(propositionId).orElseThrow();

        proposition.setStatut(StatutDemande.ACCEPTED);

        teamMemberService.addMember(
                proposition.getTeamId(),
                proposition.getCoachId(),
                RoleEquipe.COACH
        );

        // Bootstrap a Marketplace draft offer so the coach can monetise sessions.
        if (marketplaceProductService.listByProvider(proposition.getCoachId()).isEmpty()) {
            marketplaceProductService.createDraftForCoach(proposition.getCoachId());
        }

        return repository.save(proposition);
    }

    @Override
    public PropositionCoach refuserProposition(String propositionId) {

        PropositionCoach proposition = repository.findById(propositionId).orElseThrow();

        proposition.setStatut(StatutDemande.REJECTED);

        return repository.save(proposition);
    }
}
