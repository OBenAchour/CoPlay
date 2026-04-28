package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.HistoriqueAction;
import com.example.coplaybackend.Repositories.Teams.HistoriqueActionRepository;
import com.example.coplaybackend.Services.Teams.HistoriqueActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoriqueActionServiceImpl implements HistoriqueActionService {

    private final HistoriqueActionRepository historiqueActionRepository;

    @Override
    public HistoriqueAction addAction(HistoriqueAction action) {
        if (action.getPerformedAt() == null) {
            action.setPerformedAt(LocalDateTime.now());
        }
        return historiqueActionRepository.save(action);
    }

    @Override
    public List<HistoriqueAction> getActionsByTeam(String teamId) {
        return historiqueActionRepository.findByTeamId(teamId);
    }

    @Override
    public void clearActionsByTeam(String teamId) {
        historiqueActionRepository.deleteByTeamId(teamId);
    }
}
