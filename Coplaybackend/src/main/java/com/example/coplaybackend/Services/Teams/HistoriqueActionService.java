package com.example.coplaybackend.Services.Teams;

import com.example.coplaybackend.Entities.Teams.HistoriqueAction;

import java.util.List;

public interface HistoriqueActionService {

    HistoriqueAction addAction(HistoriqueAction action);

    List<HistoriqueAction> getActionsByTeam(String teamId);

    void clearActionsByTeam(String teamId);

}
