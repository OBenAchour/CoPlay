package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.Entities.Competitions.*;
import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionStatus;
import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionType;
import com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus;
import com.example.coplaybackend.Repositories.Competitions.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassementService {

    private final StatistiqueEquipeRepository statEquipeRepo;
    private final MatchCompetitionRepository matchRepo;
    private final CompetitionRepository competitionRepo;
    private final RankingService rankingService;
    private final TournoiService tournoiService;

    public List<StatistiqueEquipe> getClassement(String competitionId) {
        return statEquipeRepo.findByCompetitionId(competitionId)
                .stream()
                .sorted(getClassementComparator())
                .toList();
    }

    public List<ClassementDTO> getClassementWithDetails(String competitionId) {
        Competition competition = competitionRepo.findById(competitionId).orElseThrow();
        List<StatistiqueEquipe> stats = statEquipeRepo.findByCompetitionId(competitionId);
        
        return stats.stream()
                .sorted(getClassementComparator())
                .map(stat -> {
                    ClassementDTO dto = new ClassementDTO();
                    dto.setEquipeId(stat.getEquipe().getTeamId());
                    dto.setEquipeName(stat.getEquipe().getName());
                    dto.setMatchsJoues(stat.getMatchsJoues());
                    dto.setVictoires(stat.getVictoires());
                    dto.setDefaites(stat.getDefaites());
                    dto.setNuls(stat.getNuls());
                    dto.setButsPour(stat.getButsPour());
                    dto.setButsContre(stat.getButsContre());
                    dto.setDifferenceButs(stat.getButsPour() - stat.getButsContre());
                    dto.setPoints(stat.getPoints());
                    return dto;
                })
                .toList();
    }

    public List<MatchCompetition> getJourneeMatches(String competitionId, int journee) {
        List<MatchCompetition> allMatches = matchRepo.findByCompetitionId(competitionId);
        
        return allMatches.stream()
                .filter(m -> m.getDateMatch() != null)
                .sorted(Comparator.comparing(MatchCompetition::getDateMatch))
                .toList();
    }

    @Transactional
    public void recalculateClassementAfterMatch(MatchCompetition match) {
        String competitionId = match.getCompetition().getId();
        
        rankingService.updateStatsAfterMatch(
                competitionId,
                match.getEquipeA().getTeamId(),
                match.getEquipeB().getTeamId(),
                match.getScoreA(),
                match.getScoreB()
        );
    }

    public String getCurrentJournee(String competitionId) {
        Competition competition = competitionRepo.findById(competitionId).orElseThrow();
        
        if (competition.getType() != CompetitionType.LEAGUE) {
            return "Tournoi";
        }

        List<MatchCompetition> allMatches = matchRepo.findByCompetitionId(competitionId);
        
        long finishedMatches = allMatches.stream()
                .filter(m -> m.getStatus() == MatchStatus.FINISHED)
                .count();
        
        int totalJoueurs = (int) statEquipeRepo.count();
        int matchesPerJournee = totalJoueurs / 2;
        
        if (matchesPerJournee == 0) return "1";
        
        return String.valueOf((int) Math.ceil((double) finishedMatches / matchesPerJournee));
    }

    public ClassementDTO getEquipeDetails(String equipeId, String competitionId) {
        StatistiqueEquipe stat = statEquipeRepo.findByEquipe_TeamIdAndCompetitionId(equipeId, competitionId)
                .orElse(null);
        
        if (stat == null) {
            ClassementDTO dto = new ClassementDTO();
            dto.setEquipeId(equipeId);
            return dto;
        }

        ClassementDTO dto = new ClassementDTO();
        dto.setEquipeId(equipeId);
        dto.setEquipeName(stat.getEquipe().getName());
        dto.setMatchsJoues(stat.getMatchsJoues());
        dto.setVictoires(stat.getVictoires());
        dto.setDefaites(stat.getDefaites());
        dto.setNuls(stat.getNuls());
        dto.setButsPour(stat.getButsPour());
        dto.setButsContre(stat.getButsContre());
        dto.setDifferenceButs(stat.getButsPour() - stat.getButsContre());
        dto.setPoints(stat.getPoints());
        
        int position = getPositionInClassement(equipeId, competitionId);
        dto.setPosition(position);
        
        return dto;
    }

    private int getPositionInClassement(String equipeId, String competitionId) {
        List<StatistiqueEquipe> sorted = getClassement(competitionId);
        for (int i = 0; i < sorted.size(); i++) {
            if (sorted.get(i).getEquipe().getTeamId().equals(equipeId)) {
                return i + 1;
            }
        }
        return 0;
    }

    private Comparator<StatistiqueEquipe> getClassementComparator() {
        return Comparator
                .comparingInt(StatistiqueEquipe::getPoints).reversed()
                .thenComparingInt(stat -> stat.getButsPour() - stat.getButsContre()).reversed()
                .thenComparingInt(stat -> stat.getButsPour()).reversed()
                .thenComparing(stat -> stat.getEquipe().getName());
    }

    public static class ClassementDTO {
        private String equipeId;
        private String equipeName;
        private String equipeLogo;
        private Integer position;
        private Integer matchsJoues;
        private Integer victoires;
        private Integer defaites;
        private Integer nuls;
        private Integer butsPour;
        private Integer butsContre;
        private Integer differenceButs;
        private Integer points;

        public String getEquipeId() { return equipeId; }
        public void setEquipeId(String equipeId) { this.equipeId = equipeId; }
        public String getEquipeName() { return equipeName; }
        public void setEquipeName(String equipeName) { this.equipeName = equipeName; }
        public String getEquipeLogo() { return equipeLogo; }
        public void setEquipeLogo(String equipeLogo) { this.equipeLogo = equipeLogo; }
        public Integer getPosition() { return position; }
        public void setPosition(Integer position) { this.position = position; }
        public Integer getMatchsJoues() { return matchsJoues; }
        public void setMatchsJoues(Integer matchsJoues) { this.matchsJoues = matchsJoues; }
        public Integer getVictoires() { return victoires; }
        public void setVictoires(Integer victoires) { this.victoires = victoires; }
        public Integer getDefaites() { return defaites; }
        public void setDefaites(Integer defaites) { this.defaites = defaites; }
        public Integer getNuls() { return nuls; }
        public void setNuls(Integer nuls) { this.nuls = nuls; }
        public Integer getButsPour() { return butsPour; }
        public void setButsPour(Integer butsPour) { this.butsPour = butsPour; }
        public Integer getButsContre() { return butsContre; }
        public void setButsContre(Integer butsContre) { this.butsContre = butsContre; }
        public Integer getDifferenceButs() { return differenceButs; }
        public void setDifferenceButs(Integer differenceButs) { this.differenceButs = differenceButs; }
        public Integer getPoints() { return points; }
        public void setPoints(Integer points) { this.points = points; }
    }
}
