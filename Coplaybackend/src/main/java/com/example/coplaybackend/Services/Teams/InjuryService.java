package com.example.coplaybackend.Services.Teams;

import com.example.coplaybackend.Entities.Teams.Injury;
import com.example.coplaybackend.Entities.Teams.InjurySeverity;

import java.time.LocalDate;
import java.util.List;

public interface InjuryService {

    Injury reportInjury(String athleteId,
                        String reportedByCoachId,
                        String bodyPart,
                        InjurySeverity severity,
                        LocalDate startDate,
                        LocalDate expectedRecovery,
                        String notes);

    Injury markHealed(String injuryId);

    List<Injury> getActiveInjuries(String athleteId);

    List<Injury> getAllForAthlete(String athleteId);

    /** Returns false if the athlete has at least one ACTIVE injury. */
    boolean isAthleteAvailable(String athleteId);
}
