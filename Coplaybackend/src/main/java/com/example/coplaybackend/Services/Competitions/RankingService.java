package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.Entities.Competitions.StatistiqueEquipe;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Repositories.Competitions.StatistiqueEquipeRepository;
import com.example.coplaybackend.Services.Teams.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final StatistiqueEquipeRepository statRepo;
    private final TeamService teamService;

    @Transactional
    public StatistiqueEquipe updateStatsAfterMatch(String competitionId, String equipeAId, String equipeBId,
                                                   int scoreA, int scoreB) {

        // CORRECTION : Appel de la nouvelle méthode du repository (Equipe_TeamId)
        StatistiqueEquipe statA = statRepo.findByEquipe_TeamIdAndCompetitionId(equipeAId, competitionId)
                .orElseGet(() -> createEmptyStat(equipeAId, competitionId));

        StatistiqueEquipe statB = statRepo.findByEquipe_TeamIdAndCompetitionId(equipeBId, competitionId)
                .orElseGet(() -> createEmptyStat(equipeBId, competitionId));

        statA.setMatchsJoues(nullSafeInc(statA.getMatchsJoues()));
        statB.setMatchsJoues(nullSafeInc(statB.getMatchsJoues()));

        statA.setButsPour(nullSafeIncBy(statA.getButsPour(), scoreA));
        statA.setButsContre(nullSafeIncBy(statA.getButsContre(), scoreB));

        statB.setButsPour(nullSafeIncBy(statB.getButsPour(), scoreB));
        statB.setButsContre(nullSafeIncBy(statB.getButsContre(), scoreA));

        if (scoreA > scoreB) {
            statA.setVictoires(nullSafeInc(statA.getVictoires()));
            statB.setDefaites(nullSafeInc(statB.getDefaites()));
            statA.setPoints(nullSafeIncBy(statA.getPoints(), 3));
        } else if (scoreA < scoreB) {
            statB.setVictoires(nullSafeInc(statB.getVictoires()));
            statA.setDefaites(nullSafeInc(statA.getDefaites()));
            statB.setPoints(nullSafeIncBy(statB.getPoints(), 3));
        } else {
            statA.setNuls(nullSafeInc(statA.getNuls()));
            statB.setNuls(nullSafeInc(statB.getNuls()));
            statA.setPoints(nullSafeIncBy(statA.getPoints(), 1));
            statB.setPoints(nullSafeIncBy(statB.getPoints(), 1));
        }

        statRepo.save(statA);
        statRepo.save(statB);

        return statA;
    }

    private StatistiqueEquipe createEmptyStat(String equipeId, String competitionId) {
        StatistiqueEquipe s = new StatistiqueEquipe();

        // On récupère l'objet Team pour que la @DBRef soit valide lors du save()
        Team t = teamService.getTeamById(equipeId);
        s.setEquipe(t);

        // Pour la compétition, si tu n'as pas de CompetitionService,
        // on l'initialise au moins avec l'ID pour MongoDB
        // s.setCompetition(competitionService.getById(competitionId));

        s.setMatchsJoues(0);
        s.setVictoires(0);
        s.setNuls(0);
        s.setDefaites(0);
        s.setPoints(0);
        s.setButsPour(0);
        s.setButsContre(0);
        return s;
    }

    private Integer nullSafeInc(Integer v) {
        return (v == null) ? 1 : v + 1;
    }

    private Integer nullSafeIncBy(Integer v, int by) {
        return (v == null) ? by : v + by;
    }
}