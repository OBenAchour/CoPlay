package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.Entities.Competitions.MatchCompetition;
import com.example.coplaybackend.Repositories.Competitions.MatchCompetitionRepository;
import com.example.coplaybackend.Services.Teams.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchCompetitionRepository matchRepo;
    private final TeamService teamService;

    /**
     * Récupère tous les matchs d'une compétition spécifique.
     */
    public List<MatchCompetition> getMatchesByCompetition(String competitionId) {
        return matchRepo.findByCompetitionId(competitionId);
    }

    /**
     * Valide et enregistre le score d'un match.
     */
    @Transactional
    public MatchCompetition validateAndSaveScore(MatchCompetition match) {
        if (match.getEquipeA() == null || match.getEquipeB() == null) {
            throw new IllegalArgumentException("Les deux équipes doivent être renseignées");
        }
        return matchRepo.save(match);
    }

    /**
     * Met à jour le score d'un match spécifique.
     */
    @Transactional
    public void updateMatchScore(String id, int scoreA, int scoreB) {
        MatchCompetition match = matchRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match non trouvé avec l'ID : " + id));
        match.setScoreA(scoreA);
        match.setScoreB(scoreB);
        matchRepo.save(match);
    }

    /**
     * Logique pour récupérer les événements du match (actuellement void).
     */
    public void getMatchEvents(String id) {
        MatchCompetition match = matchRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match non trouvé avec l'ID : " + id));
        // Ici, tu pourras ajouter la logique de récupération des buts/cartons plus tard
    }
}