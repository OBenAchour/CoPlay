package com.example.coplaybackend.Services.Teams;

import com.example.coplaybackend.Entities.Teams.EquipeSponsor;

import java.util.List;

public interface EquipeSponsorService {

    EquipeSponsor addSponsor(String teamId, String sponsorName, String logoUrl);

    List<EquipeSponsor> getSponsorsByTeam(String teamId);

    void removeSponsor(String sponsorId);

}
