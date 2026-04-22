package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.PropositionCoach;
import com.example.coplaybackend.Entities.Teams.RoleEquipe;
import com.example.coplaybackend.Entities.Teams.StatutDemande;
import com.example.coplaybackend.Repositories.Teams.PropositionCoachRepository;
import com.example.coplaybackend.Services.Teams.CoachService;
import com.example.coplaybackend.Services.Teams.TeamMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CoachServiceImpl implements CoachService {

    private final PropositionCoachRepository repository;
    private final TeamMemberService teamMemberService;

    @Override
    public PropositionCoach proposerCoach(String teamId, String coachId) {

        PropositionCoach p = new PropositionCoach();

        p.setTeamId(teamId);

        // 🔥 IMPORTANT
        p.setCoachId(coachId);

        p.setStatut(StatutDemande.PENDING);

        return repository.save(p);
    }


    @Override
    public PropositionCoach accepterProposition(String propositionId) {

        PropositionCoach proposition = repository.findById(propositionId).orElseThrow();

        proposition.setStatut(StatutDemande.ACCEPTED);

        teamMemberService.addMember(
                proposition.getTeamId(),
                proposition.getCoachId(),
                RoleEquipe.COACH
        );

        return repository.save(proposition);
    }

    @Override
    public PropositionCoach refuserProposition(String propositionId) {

        PropositionCoach proposition = repository.findById(propositionId).orElseThrow();

        proposition.setStatut(StatutDemande.REJECTED);

        return repository.save(proposition);
    }

    @Override
    public List<PropositionCoach> getPropositionsByTeam(String teamId) {
        return repository.findByTeamId(teamId);
    }

    @Override
    public List<PropositionCoach> getPropositionsByCoach(String coachId) {
        return repository.findByCoachId(coachId);
    }
}
