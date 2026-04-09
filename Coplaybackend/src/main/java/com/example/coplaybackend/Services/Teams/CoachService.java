package com.example.coplaybackend.Services.Teams;
import com.example.coplaybackend.Entities.Teams.PropositionCoach;

public interface CoachService {

    PropositionCoach proposerCoach(String teamId, String coachId);

    PropositionCoach accepterProposition(String propositionId);

    PropositionCoach refuserProposition(String propositionId);

}
