package com.example.coplaybackend.Services.Teams;
import com.example.coplaybackend.Entities.Teams.DemandeAdhesion;

import java.util.List;

public interface DemandeAdhesionService {

    DemandeAdhesion demanderAdhesion(String teamId, String userId);

    DemandeAdhesion accepterDemande(String demandeId,String adminId);

    DemandeAdhesion refuserDemande(String demandeId,String adminId);

    List<DemandeAdhesion> getDemandesByUser(String userId);
    List<DemandeAdhesion> getDemandesByTeam(String teamId);

}
