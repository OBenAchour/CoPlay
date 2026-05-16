package com.example.coplaybackend.Services.Teams;

import com.example.coplaybackend.Entities.Teams.AthleteProgress;
import com.example.coplaybackend.Entities.Teams.ProgressMetric;

import java.util.List;
import java.util.Map;

public interface ProgressService {

    AthleteProgress recordProgress(String athleteId,
                                   String programId,
                                   String exerciseId,
                                   String coachId,
                                   ProgressMetric metric,
                                   Double value);

    List<AthleteProgress> getAthleteHistory(String athleteId);

    List<AthleteProgress> getProgramHistory(String athleteId, String programId);

    /** Aggregate per metric: latest value + average. */
    Map<ProgressMetric, Double> getAverageMetrics(String athleteId, String programId);
}
