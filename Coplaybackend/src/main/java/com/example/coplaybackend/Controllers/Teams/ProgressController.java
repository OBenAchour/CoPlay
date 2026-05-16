package com.example.coplaybackend.Controllers.Teams;

import com.example.coplaybackend.Entities.Teams.AthleteProgress;
import com.example.coplaybackend.Entities.Teams.ProgressMetric;
import com.example.coplaybackend.Services.Teams.ProgressService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@Tag(name = "Progress-controller", description = "Suivi du progrès des athlètes sur les exercices d'un training program")
public class ProgressController {

    private final ProgressService service;

    @PostMapping
    public AthleteProgress record(
            @RequestParam String athleteId,
            @RequestParam String programId,
            @RequestParam String exerciseId,
            @RequestParam(required = false) String coachId,
            @RequestParam ProgressMetric metric,
            @RequestParam Double value) {

        return service.recordProgress(athleteId, programId, exerciseId, coachId, metric, value);
    }

    @GetMapping("/athlete/{athleteId}")
    public List<AthleteProgress> history(@PathVariable String athleteId) {
        return service.getAthleteHistory(athleteId);
    }

    @GetMapping("/athlete/{athleteId}/program/{programId}")
    public List<AthleteProgress> programHistory(@PathVariable String athleteId,
                                                @PathVariable String programId) {
        return service.getProgramHistory(athleteId, programId);
    }

    @GetMapping("/athlete/{athleteId}/program/{programId}/averages")
    public Map<ProgressMetric, Double> averages(@PathVariable String athleteId,
                                                @PathVariable String programId) {
        return service.getAverageMetrics(athleteId, programId);
    }
}
