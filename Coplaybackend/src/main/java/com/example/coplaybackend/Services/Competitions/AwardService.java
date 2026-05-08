package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.Entities.Competitions.MatchCompetition;
import com.example.coplaybackend.Entities.Competitions.MatchEvent;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Repositories.Competitions.MatchCompetitionRepository;
import com.example.coplaybackend.Services.Auth.AuthService;
import com.example.coplaybackend.Services.Teams.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AwardService {

    private final MatchCompetitionRepository matchRepo;
    private final AuthService authService; // pour récupérer et mettre à jour l'utilisateur (incrémenter étoiles)

    /**
     * Détermine le man of the match à partir des MatchEvent (stratégie simple: le joueur avec le plus de GOAL)
     * et appelle le service Auth pour incrémenter un compteur (impl des détails dans AuthService).
     */
    @Transactional
    public User computeAndAwardManOfTheMatch(MatchCompetition match) {
        List<MatchEvent> events = match.getEvents();
        if (events == null || events.isEmpty()) return null;

        Map<String, Integer> score = new HashMap<>();
        for (MatchEvent e : events) {
            if (e == null || e.getPlayer() == null || e.getType() == null) continue;
            if ("GOAL".equalsIgnoreCase(e.getType())) {
                String playerId = e.getPlayer().getId();
                score.put(playerId, score.getOrDefault(playerId, 0) + 1);
            }
        }

        String best = null;
        int max = 0;
        for (Map.Entry<String, Integer> en : score.entrySet()) {
            if (en.getValue() > max) {
                max = en.getValue();
                best = en.getKey();
            }
        }

        if (best == null) return null;

        User u = authService.getUserById(best);
        if (u != null) {
            authService.incrementStars(u.getId(), 1);
            match.setManOfTheMatch(u);
            matchRepo.save(match);
        }
        return u;
    }
}

