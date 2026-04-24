package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.Entities.Competitions.Journee;
import com.example.coplaybackend.Entities.Competitions.MatchCompetition;
import com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus; // Import crucial
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Services.Teams.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final TeamService teamService;

    public List<Team> getTeamsFilteredBySport(String sport, int limit) {
        List<Team> allTeams = teamService.getAllTeams();
        if (allTeams == null) return new ArrayList<>();

        return allTeams.stream()
                .filter(t -> t.getSport() != null && t.getSport().equalsIgnoreCase(sport))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Journee> generateRoundRobinCalendar(List<Team> teams, LocalDate startDate, boolean doubleRound) {
        List<Team> participants = new ArrayList<>(teams);

        if (participants.size() % 2 != 0) {
            participants.add(null);
        }

        int n = participants.size();
        int rounds = n - 1;
        List<Journee> journees = new ArrayList<>();
        List<Team> rotation = new ArrayList<>(participants);

        for (int round = 0; round < rounds; round++) {
            Journee j = new Journee();
            j.setNumero(round + 1);
            j.setDatePrevue(startDate.plusDays(round * 7L));
            List<MatchCompetition> matchs = new ArrayList<>();

            for (int i = 0; i < n / 2; i++) {
                Team home = rotation.get(i);
                Team away = rotation.get(n - 1 - i);

                if (home == null || away == null) continue;

                MatchCompetition m = new MatchCompetition();
                m.setEquipeA(home);
                m.setEquipeB(away);

                // Correction appliquée ici
                m.setStatus(MatchStatus.SCHEDULED);

                m.setIsValidated(false);
                matchs.add(m);
            }
            j.setMatchs(matchs);
            journees.add(j);

            Team last = rotation.remove(rotation.size() - 1);
            rotation.add(1, last);
        }

        if (doubleRound) {
            int originalSize = journees.size();
            for (int i = 0; i < originalSize; i++) {
                Journee aller = journees.get(i);
                Journee retour = new Journee();
                retour.setNumero(originalSize + i + 1);
                retour.setDatePrevue(aller.getDatePrevue().plusDays(7L * originalSize));

                List<MatchCompetition> retourMatchs = new ArrayList<>();
                for (MatchCompetition m : aller.getMatchs()) {
                    MatchCompetition r = new MatchCompetition();
                    r.setEquipeA(m.getEquipeB());
                    r.setEquipeB(m.getEquipeA());

                    // Correction appliquée aussi pour le retour
                    r.setStatus(MatchStatus.SCHEDULED);

                    r.setIsValidated(false);
                    retourMatchs.add(r);
                }
                retour.setMatchs(retourMatchs);
                journees.add(retour);
            }
        }
        return journees;
    }
}