package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.Injury;
import com.example.coplaybackend.Entities.Teams.InjurySeverity;
import com.example.coplaybackend.Entities.Teams.InjuryStatus;
import com.example.coplaybackend.Repositories.Teams.InjuryRepository;
import com.example.coplaybackend.Services.Teams.InjuryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InjuryServiceImpl implements InjuryService {

    private final InjuryRepository repository;

    @Override
    public Injury reportInjury(String athleteId,
                               String reportedByCoachId,
                               String bodyPart,
                               InjurySeverity severity,
                               LocalDate startDate,
                               LocalDate expectedRecovery,
                               String notes) {

        Injury injury = Injury.builder()
                .athleteId(athleteId)
                .reportedByCoachId(reportedByCoachId)
                .bodyPart(bodyPart)
                .severity(severity)
                .status(InjuryStatus.ACTIVE)
                .startDate(startDate != null ? startDate : LocalDate.now())
                .expectedRecovery(expectedRecovery)
                .notes(notes)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return repository.save(injury);
    }

    @Override
    public Injury markHealed(String injuryId) {
        Injury injury = repository.findById(injuryId).orElseThrow();
        injury.setStatus(InjuryStatus.HEALED);
        injury.setUpdatedAt(LocalDateTime.now());
        return repository.save(injury);
    }

    @Override
    public List<Injury> getActiveInjuries(String athleteId) {
        return repository.findByAthleteIdAndStatus(athleteId, InjuryStatus.ACTIVE);
    }

    @Override
    public List<Injury> getAllForAthlete(String athleteId) {
        return repository.findByAthleteId(athleteId);
    }

    @Override
    public boolean isAthleteAvailable(String athleteId) {
        return repository.findByAthleteIdAndStatus(athleteId, InjuryStatus.ACTIVE).isEmpty();
    }
}
