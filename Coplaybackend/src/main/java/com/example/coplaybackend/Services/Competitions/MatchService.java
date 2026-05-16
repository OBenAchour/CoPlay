package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.Entities.Competitions.MatchCompetition;
import com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus;
import com.example.coplaybackend.Repositories.Competitions.MatchCompetitionRepository;
import com.example.coplaybackend.Services.Teams.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchCompetitionRepository matchRepo;
    private final TeamService teamService;
    private final TournoiService tournoiService;

    public List<MatchCompetition> getMatchesByCompetition(String competitionId) {
        return matchRepo.findByCompetitionId(competitionId);
    }

    @Transactional
    public void updateMatchScore(String id, int scoreA, int scoreB) {
        MatchCompetition match = matchRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match non trouvé avec l'ID : " + id));

        match.setScoreA(scoreA);
        match.setScoreB(scoreB);
        match.setStatus(MatchStatus.FINISHED);
        match.setIsValidated(true);

        matchRepo.save(match);
        tournoiService.updateResultatAfterMatch(match);
    }

    @Transactional
    public void updateMatchStatistics(String id, Map<String, Object> stats) {
        MatchCompetition match = matchRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match non trouvé"));

        System.out.println("UPDATING MATCH STATS for " + id + ": " + stats.keySet());

        try {
            if (stats.containsKey("possessionA")) {
                match.setPossessionA(Double.valueOf(stats.get("possessionA").toString()));
            }
            if (stats.containsKey("possessionB")) {
                match.setPossessionB(Double.valueOf(stats.get("possessionB").toString()));
            }
            if (stats.containsKey("videoUrl")) {
                match.setVideoUrl(stats.get("videoUrl").toString());
            }
            if (stats.containsKey("shotsA")) {
                match.setShotsA(Integer.valueOf(stats.get("shotsA").toString()));
            }
            if (stats.containsKey("shotsB")) {
                match.setShotsB(Integer.valueOf(stats.get("shotsB").toString()));
            }
            if (stats.containsKey("passAccuracyA")) {
                match.setPassAccuracyA(Double.valueOf(stats.get("passAccuracyA").toString()));
            }
            if (stats.containsKey("passAccuracyB")) {
                match.setPassAccuracyB(Double.valueOf(stats.get("passAccuracyB").toString()));
            }
            if (stats.containsKey("foulsA")) {
                match.setFoulsA(Integer.valueOf(stats.get("foulsA").toString()));
            }
            if (stats.containsKey("foulsB")) {
                match.setFoulsB(Integer.valueOf(stats.get("foulsB").toString()));
            }
            if (stats.containsKey("formationA")) {
                match.setFormationA(stats.get("formationA").toString());
            }
            if (stats.containsKey("formationB")) {
                match.setFormationB(stats.get("formationB").toString());
            }
            if (stats.containsKey("mlSummaryJson")) {
                match.setMlSummaryJson(stats.get("mlSummaryJson").toString());
            }
            if (stats.containsKey("mlStatus")) {
                match.setMlStatus(stats.get("mlStatus").toString());
            }
            if (stats.containsKey("mlJobId")) {
                match.setMlJobId(stats.get("mlJobId").toString());
            }

            matchRepo.save(match);
            System.out.println("MATCH STATS SAVED SUCCESSFULLY for " + id);

        } catch (Exception e) {
            System.err.println("MATCH STATS SAVE ERROR for " + id + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save match statistics: " + e.getMessage(), e);
        }
    }

    public void getMatchEvents(String id) {
        matchRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Match non trouvé"));
    }
}