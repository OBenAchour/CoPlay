package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.HistoriqueAction;
import com.example.coplaybackend.Repositories.Teams.HistoriqueActionRepository;
import com.example.coplaybackend.Services.Teams.HistoriqueActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoriqueActionServiceImpl implements HistoriqueActionService {

    private final HistoriqueActionRepository historiqueActionRepository;

    @Override
    public HistoriqueAction addAction(HistoriqueAction action) {
        return historiqueActionRepository.save(action);
    }

    @Override
    public List<HistoriqueAction> getActionsByTeam(String teamId) {
        return historiqueActionRepository.findByTeamId(teamId);
    }
}
