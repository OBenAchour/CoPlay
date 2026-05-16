package com.example.coplaybackend.Services.Teams.Impl;

import com.example.coplaybackend.Entities.Teams.AthleteProgress;
import com.example.coplaybackend.Entities.Teams.ProgressMetric;
import com.example.coplaybackend.Repositories.Teams.AthleteProgressRepository;
import com.example.coplaybackend.Services.Teams.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final AthleteProgressRepository repository;

    @Override
    public AthleteProgress recordProgress(String athleteId,
                                          String programId,
                                          String exerciseId,
                                          String coachId,
                                          ProgressMetric metric,
                                          Double value) {

        AthleteProgress progress = AthleteProgress.builder()
                .athleteId(athleteId)
                .programId(programId)
                .exerciseId(exerciseId)
                .coachId(coachId)
                .metric(metric)
                .value(value)
                .recordedAt(LocalDateTime.now())
                .build();

        return repository.save(progress);
    }

    @Override
    public List<AthleteProgress> getAthleteHistory(String athleteId) {
        return repository.findByAthleteId(athleteId);
    }

    @Override
    public List<AthleteProgress> getProgramHistory(String athleteId, String programId) {
        return repository.findByAthleteIdAndProgramId(athleteId, programId);
    }

    @Override
    public Map<ProgressMetric, Double> getAverageMetrics(String athleteId, String programId) {
        List<AthleteProgress> records = repository.findByAthleteIdAndProgramId(athleteId, programId);
        return records.stream()
                .collect(Collectors.groupingBy(
                        AthleteProgress::getMetric,
                        Collectors.averagingDouble(AthleteProgress::getValue)
                ));
    }
}
