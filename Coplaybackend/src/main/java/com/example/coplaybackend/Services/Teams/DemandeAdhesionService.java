package com.example.coplaybackend.Services.Teams;
import com.example.coplaybackend.Entities.Teams.DemandeAdhesion;

public interface DemandeAdhesionService {

    DemandeAdhesion demanderAdhesion(String teamId, String userId);

    DemandeAdhesion accepterDemande(String demandeId,String adminId);

    DemandeAdhesion refuserDemande(String demandeId,String adminId);

}
