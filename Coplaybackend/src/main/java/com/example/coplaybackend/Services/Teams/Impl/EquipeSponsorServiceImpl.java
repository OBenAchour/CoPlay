package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.EquipeSponsor;
import com.example.coplaybackend.Entities.Teams.HistoriqueAction;
import com.example.coplaybackend.Repositories.Teams.EquipeSponsorRepository;
import com.example.coplaybackend.Repositories.Teams.HistoriqueActionRepository;
import com.example.coplaybackend.Services.Teams.EquipeSponsorService;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipeSponsorServiceImpl implements EquipeSponsorService {

    private final EquipeSponsorRepository repository;
    private final TeamMemberService teamMemberService;
    private final HistoriqueActionRepository historiqueRepository;

    @Override
    public EquipeSponsor addSponsor(String teamId, String captainId, String sponsorName, String logoUrl, String link) {

        if (!teamMemberService.isCaptain(teamId, captainId)) {
            throw new RuntimeException("Only team captain can add sponsors");
        }

        EquipeSponsor sponsor = EquipeSponsor.builder()
                .teamId(teamId)
                .sponsorName(sponsorName)
                .logoUrl(logoUrl)
                .link(link)
                .build();

        EquipeSponsor saved = repository.save(sponsor);

        historiqueRepository.save(
                HistoriqueAction.builder()
                        .teamId(teamId)
                        .actorId(captainId)
                        .action("SPONSOR_ADDED:" + sponsorName)
                        .performedAt(LocalDateTime.now())
                        .build()
        );

        return saved;
    }

    @Override
    public List<EquipeSponsor> getSponsorsByTeam(String teamId) {
        return repository.findByTeamId(teamId);
    }

    @Override
    public void removeSponsor(String sponsorId, String captainId) {
        EquipeSponsor sponsor = repository.findById(sponsorId).orElseThrow();

        if (!teamMemberService.isCaptain(sponsor.getTeamId(), captainId)) {
            throw new RuntimeException("Only team captain can remove sponsors");
        }

        historiqueRepository.save(
                HistoriqueAction.builder()
                        .teamId(sponsor.getTeamId())
                        .actorId(captainId)
                        .action("SPONSOR_REMOVED:" + sponsor.getSponsorName())
                        .performedAt(LocalDateTime.now())
                        .build()
        );

        repository.deleteById(sponsorId);
    }
}
