package com.example.coplaybackend.Services.Teams;
import com.example.coplaybackend.Entities.Teams.PropositionCoach;

import java.util.List;

public interface CoachService {

    PropositionCoach proposerCoach(String teamId, String coachId);

    PropositionCoach accepterProposition(String propositionId);

    PropositionCoach refuserProposition(String propositionId);

    List<PropositionCoach> getPropositionsByTeam(String teamId);
    List<PropositionCoach> getPropositionsByCoach(String coachId);


}
