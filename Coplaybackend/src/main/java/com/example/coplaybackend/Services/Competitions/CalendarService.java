package com.example.coplaybackend.Services.Competitions;

import com.example.coplaybackend.Entities.Competitions.Journee;
import com.example.coplaybackend.Entities.Competitions.MatchCompetition;
import com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus;
import com.example.coplaybackend.Entities.Competitions.Inscription; // Nouvel import
import com.example.coplaybackend.Entities.Teams.Team;
import com.example.coplaybackend.Repositories.Competitions.InscriptionRepository; // Nouvel import
import com.example.coplaybackend.Repositories.Teams.TeamRepository; // Nouvel import
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final InscriptionRepository inscriptionRepository; // Pour voir qui s'est inscrit
    private final TeamRepository teamRepository; // Pour charger les détails des équipes

    /**
     * NOUVELLE MÉTHODE : Récupère uniquement les équipes inscrites et validées pour une compétition
     */
    public List<Team> getTeamsRegisteredForCompetition(String competitionId) {
        // 1. On récupère toutes les inscriptions pour CETTE compétition
        List<Inscription> registrations = inscriptionRepository.findAll().stream()
                .filter(ins -> ins.getCompetitionId().equals(competitionId) && "ACCEPTED".equals(ins.getStatus()))
                .collect(Collectors.toList());

        // 2. On transforme les IDs d'inscriptions en objets Team réels
        return registrations.stream()
                .map(ins -> teamRepository.findById(ins.getTeamId()).orElse(null))
                .filter(team -> team != null)
                .collect(Collectors.toList());
    }

    /**
     * Génération du calendrier (Ton algorithme Berger reste le même, on change juste l'entrée)
     */
    public List<Journee> generateRoundRobinCalendar(List<Team> teams, LocalDate startDate, boolean doubleRound) {
        if (teams == null || teams.size() < 2) {
            throw new RuntimeException("Il faut au moins 2 équipes pour générer un calendrier.");
        }

        List<Team> participants = new ArrayList<>(teams);

        // Si impair, on ajoute une équipe fictive (null) pour le "Bye"
        if (participants.size() % 2 != 0) {
            participants.add(null);
        }

        int n = participants.size();
        int rounds = n - 1;
        List<Journee> journees = new ArrayList<>();
        List<Team> rotation = new ArrayList<>(participants);

        // --- MATCHS ALLER ---
        for (int round = 0; round < rounds; round++) {
            Journee j = new Journee();
            j.setNumero(round + 1);
            LocalDate dateDeLaJournee = startDate.plusDays(round * 7L);
            j.setDatePrevue(dateDeLaJournee);

            List<MatchCompetition> matchs = new ArrayList<>();

            for (int i = 0; i < n / 2; i++) {
                Team home = rotation.get(i);
                Team away = rotation.get(n - 1 - i);

                if (home == null || away == null) continue;

                MatchCompetition m = new MatchCompetition();
                m.setEquipeA(home);
                m.setEquipeB(away);
                m.setDateMatch(dateDeLaJournee);
                m.setStatus(MatchStatus.SCHEDULED);
                m.setIsValidated(false);
                matchs.add(m);
            }
            j.setMatchs(matchs);
            journees.add(j);

            // Rotation (Berger Table)
            Team last = rotation.remove(rotation.size() - 1);
            rotation.add(1, last);
        }

        // --- MATCHS RETOUR ---
        if (doubleRound) {
            int originalSize = journees.size();
            for (int i = 0; i < originalSize; i++) {
                Journee aller = journees.get(i);
                Journee retour = new Journee();
                retour.setNumero(originalSize + i + 1);
                LocalDate dateRetour = aller.getDatePrevue().plusDays(7L * originalSize);
                retour.setDatePrevue(dateRetour);

                List<MatchCompetition> retourMatchs = new ArrayList<>();
                for (MatchCompetition m : aller.getMatchs()) {
                    MatchCompetition r = new MatchCompetition();
                    r.setEquipeA(m.getEquipeB()); // Inversion Home/Away
                    r.setEquipeB(m.getEquipeA());
                    r.setDateMatch(dateRetour);
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