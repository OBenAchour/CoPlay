package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.Entities.Competitions.StatistiqueEquipe;
import com.example.coplaybackend.Entities.Competitions.Match;
import com.example.coplaybackend.Repositories.Competitions.StatistiqueEquipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatistiqueService {

    private final StatistiqueEquipeRepository statistiqueEquipeRepository;

    public void updateAfterMatch(Match match) {
        // Logic to update statistics after a match
    }

    public List<StatistiqueEquipe> getGlobalRanking() {
        return statistiqueEquipeRepository.findAll()
                .stream()
                .sorted(Comparator.comparingInt(StatistiqueEquipe::getPoints).reversed()
                        .thenComparingInt(stat -> stat.getButsPour() - stat.getButsContre()))
                .toList();
    }
}
