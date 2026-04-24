package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Competitions.MatchCompetition;
import com.example.coplaybackend.Entities.Competitions.MatchEvent;
import com.example.coplaybackend.Entities.Competitions.StatistiqueJoueur;
import com.example.coplaybackend.Repositories.Competitions.StatistiqueJoueurRepository;
import com.example.coplaybackend.Services.Auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StatistiqueJoueurService {

    private final StatistiqueJoueurRepository statJoueurRepo;
    private final AuthService authService;

    @Transactional
    public void updateStatsAfterMatch(MatchCompetition match, List<MatchEvent> events) {
        String competitionId = match.getCompetition().getId();
        List<String> playerIds = extractPlayerIdsFromEvents(events);
        playerIds.addAll(extractTeamPlayers(match));

        for (String playerId : playerIds) {
            StatistiqueJoueur stat = statJoueurRepo
                    .findByJoueurIdAndCompetitionId(playerId, competitionId)
                    .orElseGet(() -> createEmptyStat(playerId, competitionId));

            stat.setMatchsJoues(nullSafeInc(stat.getMatchsJoues()));

            for (MatchEvent event : events) {
                if (event.getPlayer() != null && event.getPlayer().getId().equals(playerId)) {
                    updateStatForEvent(stat, event);
                }
            }

            if (match.getScoreA() != null && match.getScoreB() != null) {
                String winningTeamId = match.getScoreA() > match.getScoreB() 
                        ? match.getEquipeA().getTeamId() 
                        : match.getEquipeB().getTeamId();
                if (isPlayerInTeam(playerId, match, winningTeamId)) {
                    // clean sheet bonus pour gardien si clean sheet
                }
            }

            statJoueurRepo.save(stat);
        }
    }

    private void updateStatForEvent(StatistiqueJoueur stat, MatchEvent event) {
        if (event.getType() == null) return;
        
        switch (event.getType().toUpperCase()) {
            case "GOAL":
                stat.setButs(nullSafeInc(stat.getButs()));
                break;
            case "ASSIST":
                stat.setPassesDecisives(nullSafeInc(stat.getPassesDecisives()));
                break;
            case "YELLOW_CARD":
                stat.setCartonsJaunes(nullSafeInc(stat.getCartonsJaunes()));
                break;
            case "RED_CARD":
                stat.setCartonsRouges(nullSafeInc(stat.getCartonsRouges()));
                break;
            case "PENALTY":
                stat.setPenaltyMarques(nullSafeInc(stat.getPenaltyMarques()));
                break;
            case "CLEAN_SHEET":
                stat.setCleanSheets(nullSafeInc(stat.getCleanSheets()));
                break;
        }
    }

    public List<StatistiqueJoueur> getTopScorers(String competitionId) {
        return statJoueurRepo.findByCompetitionIdOrderByButsDesc(competitionId);
    }

    public List<StatistiqueJoueur> getTopPassers(String competitionId) {
        return statJoueurRepo.findByCompetitionIdOrderByPassesDecisivesDesc(competitionId);
    }

    public List<StatistiqueJoueur> getBestGoalkeepers(String competitionId) {
        return statJoueurRepo.findByCompetitionIdOrderByCleanSheetsDesc(competitionId);
    }

    public List<StatistiqueJoueur> getBestPlayers(String competitionId) {
        return statJoueurRepo.findByCompetitionIdOrderByPointsDesc(competitionId);
    }

    public List<StatistiqueJoueur> getTopStars(String competitionId) {
        return statJoueurRepo.findByCompetitionIdOrderByEtoilesDesc(competitionId);
    }

    public StatistiqueJoueur getPlayerStats(String playerId, String competitionId) {
        return statJoueurRepo.findByJoueurIdAndCompetitionId(playerId, competitionId)
                .orElse(null);
    }

    @Transactional
    public void addStar(String playerId, String competitionId) {
        StatistiqueJoueur stat = statJoueurRepo
                .findByJoueurIdAndCompetitionId(playerId, competitionId)
                .orElseGet(() -> createEmptyStat(playerId, competitionId));
        stat.setEtoiles(nullSafeInc(stat.getEtoiles()));
        statJoueurRepo.save(stat);
        
        User user = authService.getUserById(playerId);
        if (user != null) {
            authService.incrementStars(playerId, 1);
        }
    }

    private StatistiqueJoueur createEmptyStat(String playerId, String competitionId) {
        StatistiqueJoueur s = new StatistiqueJoueur();
        User player = authService.getUserById(playerId);
        s.setJoueur(player);
        s.setCompetitionId(competitionId);
        s.setMatchsJoues(0);
        s.setButs(0);
        s.setPassesDecisives(0);
        s.setCartonsJaunes(0);
        s.setCartonsRouges(0);
        s.setCleanSheets(0);
        s.setEtoiles(0);
        s.setElo(1000);
        return s;
    }

    private List<String> extractPlayerIdsFromEvents(List<MatchEvent> events) {
        List<String> ids = new ArrayList<>();
        if (events != null) {
            for (MatchEvent e : events) {
                if (e.getPlayer() != null) {
                    ids.add(e.getPlayer().getId());
                }
            }
        }
        return ids;
    }

    private List<String> extractTeamPlayers(MatchCompetition match) {
        return new ArrayList<>();
    }

    private boolean isPlayerInTeam(String playerId, MatchCompetition match, String teamId) {
        return false;
    }

    private Integer nullSafeInc(Integer v) {
        return (v == null) ? 1 : v + 1;
    }
}
