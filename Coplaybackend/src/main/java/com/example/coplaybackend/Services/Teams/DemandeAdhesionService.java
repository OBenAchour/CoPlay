package com.example.coplaybackend.Services.Teams;

import com.example.coplaybackend.Entities.Teams.DemandeAdhesion;

import java.util.List;

public interface DemandeAdhesionService {

    DemandeAdhesion demanderAdhesion(String teamId, String userId, String proposedRole);

    DemandeAdhesion accepterDemande(String demandeId, String captainId);

    DemandeAdhesion refuserDemande(String demandeId, String captainId);

    List<DemandeAdhesion> getDemandesByUser(String userId);

    List<DemandeAdhesion> getDemandesByTeam(String teamId);

    DemandeAdhesion getDemandeById(String demandeId);

    void deleteDemande(String demandeId);
}