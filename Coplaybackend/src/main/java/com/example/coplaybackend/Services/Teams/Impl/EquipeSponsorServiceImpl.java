package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.EquipeSponsor;
import com.example.coplaybackend.Repositories.Teams.EquipeSponsorRepository;
import com.example.coplaybackend.Services.Teams.EquipeSponsorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipeSponsorServiceImpl implements EquipeSponsorService {

    private final EquipeSponsorRepository repository;

    @Override
    public EquipeSponsor addSponsor(String teamId, String sponsorName, String logoUrl) {

        EquipeSponsor sponsor = EquipeSponsor.builder()
                .teamId(teamId)
                .sponsorName(sponsorName)
                .logoUrl(logoUrl)
                .build();

        return repository.save(sponsor);
    }

    @Override
    public List<EquipeSponsor> getSponsorsByTeam(String teamId) {
        return repository.findByTeamId(teamId);
    }

    @Override
    public void removeSponsor(String sponsorId) {
        repository.deleteById(sponsorId);
    }
}
