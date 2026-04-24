package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.Entities.Competitions.*;
import com.example.coplaybackend.Entities.Competitions.Enums.CompetitionStatus;
import com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus;
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Repositories.Competitions.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TournoiService {

    private final BracketTournoiRepository bracketRepo;
    private final MatchCompetitionRepository matchRepo;
    private final ResultatTournoiRepository resultatRepo;
    private final CompetitionRepository competitionRepo;

    @Transactional
    public Tournoi generateTournamentBracket(String competitionId, List<Team> teams, boolean doubleLeg) {
        Competition competition = competitionRepo.findById(competitionId)
                .orElseThrow(() -> new IllegalArgumentException("Compétition non trouvée"));

        if (!(competition instanceof Tournoi tournoi)) {
            throw new IllegalArgumentException("Ce n'est pas un tournoi");
        }

        List<Team> shuffledTeams = new ArrayList<>(teams);
        Collections.shuffle(shuffledTeams);

        int nbTeams = shuffledTeams.size();
        int rounds = (int) Math.ceil(Math.log(nbTeams) / Math.log(2));
        int bracketSize = (int) Math.pow(2, rounds);

        while (shuffledTeams.size() < bracketSize) {
            shuffledTeams.add(null);
        }

        List<BracketTournoi> brackets = new ArrayList<>();
        List<MatchCompetition> allMatches = new ArrayList<>();

        int round = 1;
        int matchesInRound = bracketSize / 2;
        LocalDate startDate = competition.getStartDate();

        Map<Integer, String> phaseNames = getPhaseNames(rounds);

        while (matchesInRound > 0) {
            BracketTournoi bracket = new BracketTournoi();
            bracket.setCompetitionId(competitionId);
            bracket.setRound(round);
            bracket.setPhase(phaseNames.get(round));
            bracket.setDateLimite(startDate.plusDays((round - 1) * 7L * (doubleLeg ? 2 : 1)).atStartOfDay());
            bracket.setEstComplete(false);
            bracket.setEstTire(true);

            List<MatchCompetition> roundMatches = new ArrayList<>();

            for (int i = 0; i < matchesInRound; i++) {
                MatchCompetition match = new MatchCompetition();
                match.setCompetition(competition);
                match.setEquipeA(shuffledTeams.get(i * 2));
                match.setEquipeB(shuffledTeams.get(i * 2 + 1));
                match.setDateMatch(startDate.plusDays((round - 1) * 7L * (doubleLeg ? 2 : 1)));
                match.setStatus(MatchStatus.SCHEDULED);
                match.setIsValidated(false);

                if (doubleLeg) {
                    MatchCompetition returnMatch = new MatchCompetition();
                    returnMatch.setCompetition(competition);
                    returnMatch.setEquipeA(shuffledTeams.get(i * 2 + 1));
                    returnMatch.setEquipeB(shuffledTeams.get(i * 2));
                    returnMatch.setDateMatch(startDate.plusDays((round - 1) * 14L + 7));
                    returnMatch.setStatus(MatchStatus.SCHEDULED);
                    returnMatch.setIsValidated(false);
                    allMatches.add(returnMatch);
                    roundMatches.add(match);
                }

                allMatches.add(match);
            }

            matchRepo.saveAll(allMatches);
            bracket.setMatchIds(allMatches.stream().map(MatchCompetition::getId).toList());
            brackets.add(bracketRepo.save(bracket));

            round++;
            matchesInRound /= 2;
        }

        tournoi.setCurrentRound(1);
        tournoi.setTotalRounds(rounds);
        tournoi.setIsDoubleLeg(doubleLeg);
        ((Tournoi) competition).setCurrentRound(1);
        ((Tournoi) competition).setTotalRounds(rounds);
        ((Tournoi) competition).setIsDoubleLeg(doubleLeg);
        competition.setStatus(CompetitionStatus.CALENDAR_GENERATED);
        competitionRepo.save(competition);

        for (Team team : teams) {
            ResultatTournoi resultat = new ResultatTournoi();
            resultat.setCompetitionId(competitionId);
            resultat.setEquipe(team);
            resultat.setEquipeId(team.getTeamId());
            resultat.setMatchsJoues(0);
            resultat.setVictoires(0);
            resultat.setDefaites(0);
            resultat.setNuls(0);
            resultat.setButsPour(0);
            resultat.setButsContre(0);
            resultat.setEstElimine(false);
            resultatRepo.save(resultat);
        }

        return tournoi;
    }

    @Transactional
    public void processRound(String competitionId, int round) {
        List<BracketTournoi> brackets = bracketRepo.findByCompetitionIdOrderByRoundAsc(competitionId);
        BracketTournoi currentBracket = brackets.stream()
                .filter(b -> b.getRound() == round)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Round non trouvé"));

        List<MatchCompetition> roundMatches = matchRepo.findByCompetitionId(competitionId)
                .stream()
                .filter(m -> {
                    String phase = getPhaseNames((int) brackets.size()).get(round);
                    return m.getStatus() == MatchStatus.FINISHED;
                })
                .toList();

        List<Team> winners = new ArrayList<>();

        for (MatchCompetition match : roundMatches) {
            Team winner = determineWinner(match);
            if (winner != null) {
                winners.add(winner);
            }
        }

        if (winners.size() == 1) {
            Competition competition = competitionRepo.findById(competitionId).orElseThrow();
            competition.setStatus(CompetitionStatus.FINISHED);
            competitionRepo.save(competition);
            return;
        }

        int nextRound = round + 1;
        if (nextRound <= brackets.size()) {
            generateNextRoundMatches(competitionId, nextRound, winners);
        }
    }

    public Team determineWinner(MatchCompetition match) {
        if (match.getStatus() != MatchStatus.FINISHED) {
            return null;
        }

        int scoreA = match.getScoreA() != null ? match.getScoreA() : 0;
        int scoreB = match.getScoreB() != null ? match.getScoreB() : 0;

        if (scoreA > scoreB) {
            return match.getEquipeA();
        } else if (scoreB > scoreA) {
            return match.getEquipeB();
        } else {
            if (match.getPenaltyScoreA() != null && match.getPenaltyScoreB() != null) {
                if (match.getPenaltyScoreA() > match.getPenaltyScoreB()) {
                    return match.getEquipeA();
                } else {
                    return match.getEquipeB();
                }
            }
        }
        return null;
    }

    @Transactional
    public void eliminateTeam(String equipeId, String competitionId, String round) {
        resultatRepo.findByEquipeIdAndCompetitionId(equipeId, competitionId)
                .ifPresent(resultat -> {
                    resultat.setEstElimine(true);
                    resultat.setEliminatedAtRound(round);
                    resultatRepo.save(resultat);
                });
    }

    @Transactional
    public void updateResultatAfterMatch(MatchCompetition match) {
        String competitionId = match.getCompetition().getId();
        Team teamA = match.getEquipeA();
        Team teamB = match.getEquipeB();

        ResultatTournoi resultatA = resultatRepo.findByEquipeIdAndCompetitionId(teamA.getTeamId(), competitionId)
                .orElse(null);
        ResultatTournoi resultatB = resultatRepo.findByEquipeIdAndCompetitionId(teamB.getTeamId(), competitionId)
                .orElse(null);

        if (resultatA != null) {
            resultatA.setMatchsJoues(nullSafeInc(resultatA.getMatchsJoues()));
            resultatA.setButsPour(nullSafeIncBy(resultatA.getButsPour(), match.getScoreA()));
            resultatA.setButsContre(nullSafeIncBy(resultatA.getButsContre(), match.getScoreB()));
        }

        if (resultatB != null) {
            resultatB.setMatchsJoues(nullSafeInc(resultatB.getMatchsJoues()));
            resultatB.setButsPour(nullSafeIncBy(resultatB.getButsPour(), match.getScoreB()));
            resultatB.setButsContre(nullSafeIncBy(resultatB.getButsContre(), match.getScoreA()));
        }

        int scoreA = match.getScoreA() != null ? match.getScoreA() : 0;
        int scoreB = match.getScoreB() != null ? match.getScoreB() : 0;

        if (scoreA > scoreB) {
            if (resultatA != null) resultatA.setVictoires(nullSafeInc(resultatA.getVictoires()));
            if (resultatB != null) resultatB.setDefaites(nullSafeInc(resultatB.getDefaites()));
        } else if (scoreB > scoreA) {
            if (resultatB != null) resultatB.setVictoires(nullSafeInc(resultatB.getVictoires()));
            if (resultatA != null) resultatA.setDefaites(nullSafeInc(resultatA.getDefaites()));
        } else {
            if (match.getPenaltyScoreA() != null && match.getPenaltyScoreB() != null) {
                if (match.getPenaltyScoreA() > match.getPenaltyScoreB()) {
                    if (resultatA != null) {
                        resultatA.setVictoires(nullSafeInc(resultatA.getVictoires()));
                        resultatA.setPenaltiesGagnes(nullSafeInc(resultatA.getPenaltiesGagnes()));
                    }
                    if (resultatB != null) {
                        resultatB.setDefaites(nullSafeInc(resultatB.getDefaites()));
                        resultatB.setPenaltiesPerdus(nullSafeInc(resultatB.getPenaltiesPerdus()));
                    }
                    eliminateTeam(teamB.getTeamId(), competitionId, "QUART");
                } else {
                    if (resultatB != null) {
                        resultatB.setVictoires(nullSafeInc(resultatB.getVictoires()));
                        resultatB.setPenaltiesGagnes(nullSafeInc(resultatB.getPenaltiesGagnes()));
                    }
                    if (resultatA != null) {
                        resultatA.setDefaites(nullSafeInc(resultatA.getDefaites()));
                        resultatA.setPenaltiesPerdus(nullSafeInc(resultatA.getPenaltiesPerdus()));
                    }
                    eliminateTeam(teamA.getTeamId(), competitionId, "QUART");
                }
            } else {
                if (resultatA != null) resultatA.setNuls(nullSafeInc(resultatA.getNuls()));
                if (resultatB != null) resultatB.setNuls(nullSafeInc(resultatB.getNuls()));
            }
        }

        if (resultatA != null) resultatRepo.save(resultatA);
        if (resultatB != null) resultatRepo.save(resultatB);
    }

    public List<ResultatTournoi> getClassementTournoi(String competitionId) {
        return resultatRepo.findByCompetitionIdOrderByPositionFinaleAsc(competitionId);
    }

    private void generateNextRoundMatches(String competitionId, int round, List<Team> winners) {
        Competition competition = competitionRepo.findById(competitionId).orElseThrow();

        BracketTournoi bracket = bracketRepo.findByCompetitionIdAndRound(competitionId, round)
                .orElseGet(() -> {
                    BracketTournoi newBracket = new BracketTournoi();
                    newBracket.setCompetitionId(competitionId);
                    newBracket.setRound(round);
                    newBracket.setPhase(getPhaseNames((int) bracketRepo.count()).get(round));
                    newBracket.setEstComplete(false);
                    return newBracket;
                });

        List<MatchCompetition> nextMatches = new ArrayList<>();
        LocalDate date = bracket.getDateLimite() != null ? bracket.getDateLimite().toLocalDate() : LocalDate.now();

        for (int i = 0; i < winners.size(); i += 2) {
            if (i + 1 < winners.size()) {
                MatchCompetition match = new MatchCompetition();
                match.setCompetition(competition);
                match.setEquipeA(winners.get(i));
                match.setEquipeB(winners.get(i + 1));
                match.setDateMatch(date);
                match.setStatus(MatchStatus.SCHEDULED);
                match.setIsValidated(false);
                nextMatches.add(match);
            }
        }

        matchRepo.saveAll(nextMatches);
        bracket.setMatchIds(nextMatches.stream().map(MatchCompetition::getId).toList());
        bracketRepo.save(bracket);
    }

    private Map<Integer, String> getPhaseNames(int totalRounds) {
        Map<Integer, String> phases = new LinkedHashMap<>();
        phases.put(totalRounds, "QUART_FINALE");
        phases.put(totalRounds - 1, "DEMI_FINALE");
        phases.put(totalRounds - 2, "FINALE");

        for (int i = totalRounds - 3; i >= 1; i--) {
            phases.put(i, "ROUND_" + i);
        }

        return phases;
    }

    private Integer nullSafeInc(Integer v) {
        return (v == null) ? 1 : v + 1;
    }

    private Integer nullSafeIncBy(Integer v, int by) {
        return (v == null) ? by : v + by;
    }
}
