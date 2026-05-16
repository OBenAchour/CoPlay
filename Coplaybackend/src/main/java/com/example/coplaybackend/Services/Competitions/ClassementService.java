package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.Entities.Competitions.MatchCompetition;
import com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus;
import com.example.coplaybackend.Repositories.Competitions.MatchCompetitionRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassementService {

    private final MatchCompetitionRepository matchRepo;

    // --- CETTE MÉTHODE RÉSOUT TON ERREUR DE COMPILATION ---
    public void updateClassement(String competitionId) {
        // Le calcul est fait à la volée dans getClassementWithDetails,
        // donc on n'a pas besoin de logique ici pour l'instant.
        System.out.println("Signal de mise à jour reçu pour la compétition : " + competitionId);
    }

    public int getCurrentJournee(String competitionId) {
        return matchRepo.findByCompetitionId(competitionId).stream()
                .filter(m -> m.getStatus() == MatchStatus.FINISHED)
                .mapToInt(MatchCompetition::getNumeroJournee)
                .max()
                .orElse(1);
    }

    public ClassementDTO getEquipeDetails(String equipeId, String competitionId) {
        return getClassementWithDetails(competitionId).stream()
                .filter(dto -> dto.getTeamId().equals(equipeId))
                .findFirst()
                .orElse(new ClassementDTO(equipeId, "Équipe inconnue"));
    }

    public List<ClassementDTO> getClassementWithDetails(String competitionId) {
        List<MatchCompetition> matches = matchRepo.findByCompetitionId(competitionId).stream()
                .filter(m -> m.getStatus() == MatchStatus.FINISHED)
                .toList();

        Map<String, ClassementDTO> stats = new HashMap<>();

        for (MatchCompetition m : matches) {
            String idA = m.getEquipeA().getTeamId();
            String idB = m.getEquipeB().getTeamId();

            stats.putIfAbsent(idA, new ClassementDTO(idA, m.getEquipeA().getName()));
            stats.putIfAbsent(idB, new ClassementDTO(idB, m.getEquipeB().getName()));

            ClassementDTO dtoA = stats.get(idA);
            ClassementDTO dtoB = stats.get(idB);

            dtoA.setPlayed(dtoA.getPlayed() + 1);
            dtoB.setPlayed(dtoB.getPlayed() + 1);

            if (m.getScoreA() > m.getScoreB()) {
                dtoA.setPoints(dtoA.getPoints() + 3);
                dtoA.setWon(dtoA.getWon() + 1);
                dtoB.setLost(dtoB.getLost() + 1);
            } else if (m.getScoreA() < m.getScoreB()) {
                dtoB.setPoints(dtoB.getPoints() + 3);
                dtoB.setWon(dtoB.getWon() + 1);
                dtoA.setLost(dtoA.getLost() + 1);
            } else {
                dtoA.setPoints(dtoA.getPoints() + 1);
                dtoB.setPoints(dtoB.getPoints() + 1);
                dtoA.setDrawn(dtoA.getDrawn() + 1);
                dtoB.setDrawn(dtoB.getDrawn() + 1);
            }
        }

        return stats.values().stream()
                .sorted(Comparator.comparing(ClassementDTO::getPoints).reversed())
                .collect(Collectors.toList());
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ClassementDTO {
        private String teamId;
        private String teamName;
        private int points = 0;
        private int played = 0;
        private int won = 0;
        private int drawn = 0;
        private int lost = 0;

        public ClassementDTO(String teamId, String teamName) {
            this.teamId = teamId;
            this.teamName = teamName;
        }
    }
}