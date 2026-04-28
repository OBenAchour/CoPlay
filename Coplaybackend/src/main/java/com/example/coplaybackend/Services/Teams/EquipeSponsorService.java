package com.example.coplaybackend.Services.Teams;

import com.example.coplaybackend.Entities.Teams.EquipeSponsor;

import java.util.List;

public interface EquipeSponsorService {

    EquipeSponsor addSponsor(String teamId, String captainId, String sponsorName, String logoUrl, String link);

    List<EquipeSponsor> getSponsorsByTeam(String teamId);

    void removeSponsor(String sponsorId, String captainId);

}
